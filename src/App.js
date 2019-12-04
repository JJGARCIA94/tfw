import React from 'react';
import Header from './components/header/header';
import NewUser from './components/users/newUser';
import Users from './components/users/users';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Products from './components/products/products';

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
					<Switch>
						<Route exact path="/" component={Users} />
						<Route exact path="/newUser" component={NewUser} />	
						<Route exact path="/products" component={Products} />	
					</Switch>
				</div>
			</Router>
		</ApolloProvider>
	);
}

export default App;
