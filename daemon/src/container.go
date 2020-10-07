package src

import (
	"context"
	"fmt"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"io"
	"os"
	"sync"
)

type ContainerList struct {
	Tasks []*Container `json:"tasks"`
}

type Container struct {
	URL    string `json:"url"`
	IP     string `json:"ip"`
	Status string `json:"status"`
	ID     string `json:"_id"`
}

func (d *Daemon) DeleteContainer(ctx context.Context, w *sync.WaitGroup, id string) {
	defer w.Done()

	ctrId, ok := d.ContainerNames[id]
	if !ok {
		fmt.Println("no container with name " + id)
		return
	}
	err := d.DockerClient.ContainerRemove(ctx, ctrId, types.ContainerRemoveOptions{
		RemoveVolumes: true,
		Force:         true,
	})
	if err != nil {
		fmt.Println("can't remove container " + ctrId + err.Error())
		return
	}

	for {
		_, err := d.DockerClient.ContainerInspect(ctx, ctrId)
		if err != nil {
			break
		}
	}

	if err := d.UpdateStatus(id, "deleted"); err != nil {
		fmt.Println("can't update status of " + id)
		return
	}
	delete(d.ContainerNames, id)
	fmt.Println("container deleted " + id)
}

func (d *Daemon) CreateContainer(ctx context.Context, w *sync.WaitGroup, url string, id string) {
	defer w.Done()
	reader, err := d.DockerClient.ImagePull(ctx, url, types.ImagePullOptions{})
	if err != nil {
		fmt.Println("can't pull image " + url)
		if err := d.UpdateStatus(id, "deleted"); err != nil {
			fmt.Println("can't update status of " + id)
		}
		return
	}
	io.Copy(os.Stdout, reader)

	resp, err := d.DockerClient.ContainerCreate(ctx, &container.Config{
		Image: url,
	}, &container.HostConfig{
		PublishAllPorts: true,
	}, nil, nil, id)
	if err != nil {
		fmt.Println("can't create container " + id)
		return
	}

	if err := d.DockerClient.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		fmt.Println("can't start container " + resp.ID)
		return
	}

	c := types.ContainerJSON{}
	for {
		c, err = d.DockerClient.ContainerInspect(ctx, resp.ID)
		if err != nil {
			fmt.Println("can't inspect container " + resp.ID)
			return
		}
		if c.State.Status == "running" {
			break
		}
	}

	if err := d.UpdateStatus(id, c.State.Status); err != nil {
		fmt.Println("can't update status of " + id)
		return
	}
	d.ContainerNames[id] = c.ID
	fmt.Println("container running " + id)
}
