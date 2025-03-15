#ifndef HTTP_HANDLER_H
#define HTTP_HANDLER_H

#include <sys/socket.h>
#include <sys/epoll.h>

#define MAX_HEADERS 20
#define MAX_PATH 256
#define BUFFER_SIZE 2048

struct http_request {
	char method[8];
	char path[MAX_PATH];
	char headers[MAX_HEADERS][2][256];
	int header_count;
	char buffer[BUFFER_SIZE];
	size_t buffer_len;
};

void handle_request(int clientfd, int epollfd);
void parse_request(struct http_request* req);
void send_response(int clientfd, const char* status, const char* content_type, const char* body);
void send_file(int clientfd, const char* filepath);

#endif
