package main

import (
	"github.com/Tolkie/BYOP/daemon/src"
	"github.com/docker/docker/client"
	"log"
	"net/http"
	"time"
)

func main() {
	dockerClient, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal(err)
	}
	defer dockerClient.Close()

	httpClient := &http.Client{
		Timeout: 5 * time.Second,
	}

	containers := map[string]string{}

	d := &src.Daemon{
		DockerClient:   dockerClient,
		HttpClient:     httpClient,
		ContainerNames: containers,
	}

	if err := d.Init(); err != nil {
		log.Fatal("can't init daemon")
	}

	log.Fatal(d.Run())
}
