import { Chip, Paper, Select, MenuItem, Grid, InputLabel, FormControl, FormHelperText } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { isString } from "lodash";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import { Field, Form } from "formik";
import { useHistory } from "react-router-dom";
const useStyles = makeStyles((theme) => ({
    menuListItem: {
        paddingTop: 0,
        paddingBottom: 0,
        border: "none",
    },
    menuItem: {
        maxHeight: 36,
        color: theme.palette.text.primary,
    },
    menuPaper: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`,
    },
    inputLabel: {
        color: `${theme.palette.text.secondary} !important`,
    },
    selectRoot: {
        color: `${theme.palette.text.primary} !important`,
        backgroundColor:
            theme.palette.type === "dark"
                ? "rgba(255,255,255,0.03)"
                : theme.palette.background.paper,
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: `${theme.palette.divider} !important`,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: `${theme.palette.text.secondary} !important`,
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: `${theme.palette.primary.main} !important`,
        },
    },
    chips: {
        display: "flex",
        flexWrap: "wrap",
    },
    chip: {
        margin: 2,
    },
}));
export function TagsKanbanContainer({ ticket }) {
    const classes = useStyles();
    const history = useHistory();

    const [tags, setTags] = useState([]);
    const [selected, setSelected] = useState("");

    useEffect(() => {
        let isMounted = true;
        loadTags(isMounted).then(() => {
            if (ticket.tags && ticket.tags.length > 0) {
                setSelected(ticket.tags[0].id); // Alterado para pegar o ID da primeira tag, se existir
            }
        });

        return () => {
            isMounted = false;
        };
    }, [ticket.tags]);

    const loadTags = async (isMounted) => {
        try {
            const { data } = await api.get(`/tags/list`, { params: { kanban: 1 } });
            if (isMounted) {
                setTags(data);
            }
        } catch (err) {
            toastError(err);
        }
    }

    const onChange = async (e) => {
        const value = e.target.value;
        if (ticket.tags.length > 0) {
            await api.delete(`/ticket-tags/${ticket.id}`);
            // toast.success('Ticket Tag Removido!');
        }
        if (value !== null && value !== "") {
            await api.put(`/ticket-tags/${ticket.id}/${value}`);
            // toast.success('Ticket Tag Adicionado com Sucesso!');
        }
        setSelected(value);
        // Adicione sua lógica de manipulação de tags aqui
    }

    const renderSelectedValue = () => {
        const selectedTag = tags.find(tag => tag.id === selected);
        if (!selectedTag) {
            return <span style={{ color: "inherit" }}>Selecione...</span>;
        }

        return (
            <Chip
                style={{
                    backgroundColor: selectedTag.color,
                    color: "#FFF",
                    marginRight: 1,
                    padding: 1,
                    fontWeight: 'bold',
                    paddingLeft: 5,
                    paddingRight: 5,
                    borderRadius: 3,
                    fontSize: "0.8em",
                    whiteSpace: "nowrap"
                }}
                label={selectedTag.name}
                size="small"
            />
        );
    };

    return (
        <>
            <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel id="tag-kanban-id" className={classes.inputLabel}>
                    {i18n.t("Etapa Kanban")}
                </InputLabel>
                <Select
                    className={classes.selectRoot}
                    labelWidth={60}
                    value={selected}
                    labelId="tag-kanban-id"
                    label={i18n.t("Etapa Kanban")}
                    onChange={onChange}
                    MenuProps={{
                        classes: { paper: classes.menuPaper },
                        anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                        },
                        transformOrigin: {
                            vertical: "top",
                            horizontal: "left",
                        },
                        getContentAnchorEl: null,
                    }}
                    renderValue={renderSelectedValue}
                >
                    <MenuItem value="" className={classes.menuItem}>Selecione...</MenuItem>
                    {tags.map(tag => (
                        <MenuItem key={tag.id} value={tag.id} className={classes.menuItem}>
                            {tag.name}
                        </MenuItem>
                    ))}
                </Select>
                {tags.length === 0 && (
                    <FormHelperText>
                        Nenhuma etapa Kanban cadastrada para esta empresa.{" "}
                        <span
                            style={{ color: "#00b0ff", cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => history.push("/tagsKanban")}
                        >
                            Clique para cadastrar
                        </span>
                    </FormHelperText>
                )}
            </FormControl>
        </>
    )
}
