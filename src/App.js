import React from "react";
import Header from "./components/header/header";
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { ApolloProvider } from "react-apollo";
import { /* BrowserRouter as Router, */ HashRouter } from "react-router-dom";
import { getMainDefinition } from "apollo-utilities";

const httpLink = new HttpLink({
  uri: "https://api.mazatlancombatclub.com/v1/graphql",
  headers: {
    "x-hasura-admin-secret": "twfmazatlan"
  }
});

const wsLink = new WebSocketLink({
  uri: "wss://api.mazatlancombatclub.com/v1/graphql",
  options: {
    reconnect: true,
    connectionParams: {
      headers: {
        "x-hasura-admin-secret": "twfmazatlan"
      }
    }
  }
});

const link = split(
  ({ query }) => {
    const mainDefinition = getMainDefinition(query);
    return (
      mainDefinition.kind === "OperationDefinition" &&
      mainDefinition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache()
});

function App() {
  return (
    <ApolloProvider client={client}>
      <HashRouter>
        <div className="App">
          <Header />
        </div>
      </HashRouter>
    </ApolloProvider>
  );
}

export default App;
