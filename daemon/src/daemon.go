package src

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/oklog/run"
	"net"
	"net/http"
	"sync"
	"time"
)

const (
	baseURL = "http://localhost:5000/byop"
)

type Daemon struct {
	DockerClient   *client.Client
	HttpClient     *http.Client
	ContainerNames map[string]string
}

func (d *Daemon) Run() error {
	g := run.Group{}

	g.Add(d.LaunchTasks,
		func(error) {
			fmt.Println("launch interrupt")
		})
	g.Add(d.DeleteTasks,
		func(error) {
			fmt.Println("delete interrupt")
		})
	return g.Run()
}

func (d *Daemon) Init() error {
	ctx := context.Background()

	containers, err := d.DockerClient.ContainerList(ctx, types.ContainerListOptions{})
	if err != nil {
		return err
	}
	for _, ctr := range containers {
		d.ContainerNames[ctr.Names[0][1:]] = ctr.ID
	}
	return nil
}

func (d *Daemon) LaunchTasks() error {
	for {
		ctx := context.Background()
		containerList := &ContainerList{}

		route := fmt.Sprint(baseURL + "/tasks?status=pending")

		resp, err := d.HttpClient.Get(route)
		if err != nil {
			fmt.Println("Couldn't get containers list: ", err)
		}

		err = json.NewDecoder(resp.Body).Decode(&containerList)
		if err != nil {
			fmt.Println("Couldn't decode containers list: ", err)
		}

		w := &sync.WaitGroup{}
		for _, c := range containerList.Tasks {
			w.Add(1)
			go d.CreateContainer(ctx, w, c.URL, c.ID)
		}
		w.Wait()
		time.Sleep(time.Second * 5)
	}
}

func (d *Daemon) DeleteTasks() error {
	for {
		ctx := context.Background()
		containerList := &ContainerList{}

		route := fmt.Sprint(baseURL + "/tasks?status=awaitingDeletion")

		resp, err := d.HttpClient.Get(route)
		if err != nil {
			fmt.Println("Couldn't get containers list: ", err)
		}

		err = json.NewDecoder(resp.Body).Decode(&containerList)
		if err != nil {
			fmt.Println("Couldn't decode containers list: ", err)
		}

		w := &sync.WaitGroup{}
		for _, c := range containerList.Tasks {
			w.Add(1)
			go d.DeleteContainer(ctx, w, c.ID)
		}
		w.Wait()
		time.Sleep(time.Second * 5)
	}
}

func (d *Daemon) UpdateStatus(id string, status string) error {
	body := bytes.NewBuffer([]byte{})
	ctr := &Container{
		IP:     getLocalIP(),
		Status: status,
	}

	err := json.NewEncoder(body).Encode(ctr)
	if err != nil {
		return err
	}

	route := fmt.Sprint(baseURL + "/task/" + id)

	req, err := http.NewRequest("PUT", route, body)
	if err != nil {
		return err
	}
	req.Header.Add("Content-Type", "application/json")

	_, err = d.HttpClient.Do(req)
	if err != nil {
		return err
	}

	return nil
}

func getLocalIP() string {
	netInterfaceAddresses, err := net.InterfaceAddrs()
	if err != nil {
		return ""
	}
	for _, netInterfaceAddress := range netInterfaceAddresses {
		networkIp, ok := netInterfaceAddress.(*net.IPNet)
		if ok && !networkIp.IP.IsLoopback() && networkIp.IP.To4() != nil {
			ip := networkIp.IP.String()
			return ip
		}
	}
	return ""
}
