import React, { useContext } from "react";
import { Route as RouterRoute, Redirect } from "react-router-dom";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const Route = ({ component: Component, isPrivate = false, ...rest }) => {
	const { isAuth, loading } = useContext(AuthContext);

	// Rota privada sem sessão confirmada: enquanto loading, só backdrop (aguarda refresh do token).
	if (!isAuth && isPrivate) {
		if (loading) {
			return <BackdropLoading />;
		}
		return (
			<Redirect to={{ pathname: "/login", state: { from: rest.location } }} />
		);
	}

	// Já autenticado em rota pública (ex.: /login): redireciona sem bloquear a UI com backdrop por cima da app.
	if (isAuth && !isPrivate) {
		if (loading) {
			return <BackdropLoading />;
		}
		return <Redirect to={{ pathname: "/", state: { from: rest.location } }} />;
	}

	return <RouterRoute {...rest} component={Component} />;
};

export default Route;
