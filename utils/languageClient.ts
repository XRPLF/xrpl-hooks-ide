import { MessageConnection } from "@codingame/monaco-jsonrpc";
import { CloseAction, createConnection, ErrorAction, MonacoLanguageClient } from "@codingame/monaco-languageclient";
import Router from "next/router";
import normalizeUrl from "normalize-url";
import ReconnectingWebSocket from "reconnecting-websocket";

export function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name: "Clangd Language Client",
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ['c', 'h'],
      // disable the default error handler
      errorHandler: {
        error: () => ErrorAction.Continue,
        closed: () => {
          if (Router.pathname.includes('/develop')) {
            return CloseAction.Restart
          } else {
            return CloseAction.DoNotRestart
          }
        }
      },

    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        return Promise.resolve(createConnection(connection, errorHandler, closeHandler))
      }
    }
  });
}

export function createUrl(path: string): string {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  return normalizeUrl(`${protocol}://${location.host}${location.pathname}${path}`);
}

export function createWebSocket(url: string): ReconnectingWebSocket {
  const socketOptions = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 10000,
    maxRetries: Infinity,
    debug: false
  };
  return new ReconnectingWebSocket(url, [], socketOptions);
}
