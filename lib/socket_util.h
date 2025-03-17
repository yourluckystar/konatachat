#ifndef SOCKET_UTIL_H
#define SOCKET_UTIL_H

#include <sys/socket.h>

int setup_server(const char* port);
int start_listening(int sockfd, int backlog);
int accept_connection(int sockfd);

#endif
