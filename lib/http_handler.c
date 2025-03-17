#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include "http_handler.h"

void handle_request(int clientfd) {
	char buffer[1024];
	ssize_t bytes_read;

	bytes_read = read(clientfd, buffer, sizeof(buffer) -1);
	if (bytes_read < 0) {
		perror("failed to read from client");
		return;
	}
	buffer[bytes_read] = '\0';
	printf("received request:\n%s\n", buffer);

	const char* response =
		"HTTP/1.1 200 OK\r\n"
		"Content-Type: text/plain\r\n"
		"Content-Length: 13\r\n"
		"\r\n"
		"hi";
	if (write(clientfd, response, strlen(response)) < 0) {
		perror("failed to send response");
	}
}
