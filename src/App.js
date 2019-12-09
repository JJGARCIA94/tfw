import React from 'react';
import Header from './components/header/header';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter as Router } from 'react-router-dom';

const client = new ApolloClient({
	link: new HttpLink({
		uri: 'https://tfw-mazatlan.herokuapp.com/v1/graphql',
		headers: {
			'x-hasura-admin-secret': 'twfmazatlan'
		}
	}),
	cache: new InMemoryCache()
});

function App() {
	return (
		<ApolloProvider client={client}>
			<Router>
				<div className="App">
					<Header />
				</div>
			</Router>
		</ApolloProvider>
	);
}

export default App;
