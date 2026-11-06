import React from "react";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => ({
	mainContainer: {
		flex: 1,
		padding: theme.spacing(2),
		height: `calc(100% - 48px)`,
	},

	contentWrapper: {
		height: "100%",
		overflowY: "hidden",
		display: "flex",
		flexDirection: "column",
	},
}));

const MainContainer = ({ children, className }) => {
	const classes = useStyles();

	return (
		<Container className={classes.mainContainer} maxWidth={false}>
			<div className={clsx(classes.contentWrapper, className)}>{children}</div>
		</Container>
	);
};

export default MainContainer;
