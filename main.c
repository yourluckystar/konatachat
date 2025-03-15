#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/epoll.h>
#include <fcntl.h>
#include "socket_util.h"
#include "http_handler.h"

#define PORT "11945"
#define MAX_EVENTS 10
#define MAX_CLIENTS 5

int main() {
	int sockfd = setup_server(PORT);
	if (sockfd == -1) {
		fprintf(stderr, "failed to set up server\n");
		return 1;
	}

	if (start_listening(sockfd, 10) == -1) {
		fprintf(stderr,  "failed to start listening\n");
		return 1;
	}

	int epollfd = epoll_create1(0);
	if (epollfd == -1) {
		perror("epoll_create1");
		close(sockfd);
		exit(EXIT_FAILURE);
	}

	struct epoll_event ev, events[MAX_EVENTS];
	ev.events = EPOLLIN;
	ev.data.fd = sockfd;
	if (epoll_ctl(epollfd, EPOLL_CTL_ADD, sockfd, &ev) == -1) {
		perror("epoll_ctl failed for sockfd");
		close(epollfd);
		close(sockfd);
		return 1;
	}

	printf("konatachat started on https://localhost:11945\n");

	while (1) {
		int nfds = epoll_wait(epollfd, events, MAX_EVENTS, -1);
		if (nfds == -1) {
			perror("epoll_wait");
			break;
		}

		for (int i = 0; i < nfds; ++i) {
			if (events[i].data.fd == sockfd) {
				int clientfd = accept_connection(sockfd);
				if (clientfd == -1) {
					fprintf(stderr, "failed to accept connection\n");
					continue;
				}

				// setnonblocking
				int flags = fcntl(clientfd, F_GETFL, 0);
				fcntl(clientfd, F_SETFL, flags | O_NONBLOCK);

				ev.events = EPOLLIN;
				ev.data.fd = clientfd;
				if (epoll_ctl(epollfd, EPOLL_CTL_ADD, clientfd, &ev) == -1) {
					perror("epoll_ctl: clientfd");
					close(clientfd);
					continue;
				}
			} else {
				int clientfd = events[i].data.fd;
				handle_request(clientfd, epollfd);
			}
		}
	}

	close(epollfd);
	close(sockfd);
	return 0;
}
