#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <unistd.h>
#include "socket_util.h"

int setup_server(const char* port) {
	struct addrinfo hints, *result, *rp;
	int sockfd = -1;

	memset(&hints, 0, sizeof(hints));
	hints.ai_family = AF_UNSPEC;
	hints.ai_socktype = SOCK_STREAM;
	hints.ai_flags = AI_PASSIVE;
	hints.ai_protocol = 0;
	hints.ai_canonname = NULL;
	hints.ai_addr = NULL;
	hints.ai_next = NULL;

	if (getaddrinfo(NULL, port, &hints, &result) != 0) {
		perror("getaddrinfo failed");
		return -1;
	}

	for (rp = result; rp != NULL; rp = rp->ai_next) {
		sockfd = socket(rp->ai_family, rp->ai_socktype, rp->ai_protocol);
		if (sockfd == -1)
			continue;

		if (bind(sockfd, rp->ai_addr, rp->ai_addrlen) == 0)
			break;

		close(sockfd);
		sockfd = -1;
	}

	freeaddrinfo(result);

	if (sockfd == -1) {
		perror("failed to bind");
		return -1;
	}

	return sockfd;
}

int start_listening(int sockfd, int backlog) {
	if (listen(sockfd, backlog) == -1) {
		perror("listen failed");
		return -1;
	}
	return 0;
}

int accept_connection(int sockfd) {
	struct sockaddr_storage client_addr;
	socklen_t addr_size = sizeof(client_addr);
	
	int clientfd = accept(sockfd, (struct sockaddr*)&client_addr, &addr_size);
	if (clientfd == -1) {
		perror("accept failed");
		return -1;
	}

	return clientfd;
}
