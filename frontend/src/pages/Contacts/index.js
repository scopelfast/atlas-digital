import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
  useMemo,
} from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { alpha, makeStyles, useTheme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";

import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import BlockIcon from "@material-ui/icons/Block";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { TagsFilter } from "../../components/TagsFilter";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import formatSerializedId from "../../utils/formatSerializedId";
import { v4 as uuidv4 } from "uuid";

import { ArrowDropDown, Backup, ContactPhone } from "@material-ui/icons";
import { Menu, MenuItem } from "@material-ui/core";

import ContactImportWpModal from "../../components/ContactImportWpModal";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import { adminShellTabBarMixin } from "../../theme/adminShellStyles";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

// ================= GEO / DDD CONFIG DO MAPA =================

/** Mesma origem primeiro (fiável no dev); depois CDNs. GeoJSON Feature[], nunca URL crua no Geographies (TopoJSON bug). */
const GEO_JSON_URLS = [
  `${process.env.PUBLIC_URL || ""}/geo/brazil-states.geojson`,
  "https://cdn.jsdelivr.net/gh/codeforamerica/click_that_hood@master/public/data/brazil-states.geojson",
  "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson",
];

async function fetchBrazilStateFeatures() {
  for (let i = 0; i < GEO_JSON_URLS.length; i++) {
    const url = GEO_JSON_URLS[i];
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && Array.isArray(data.features) && data.features.length > 0) {
        return data.features;
      }
    } catch (_) {
      /* tenta próxima origem */
    }
  }
  return [];
}

const dddList = {
  "11": "São Paulo",
  "12": "São Paulo",
  "13": "São Paulo",
  "14": "São Paulo",
  "15": "São Paulo",
  "16": "São Paulo",
  "17": "São Paulo",
  "18": "São Paulo",
  "19": "São Paulo",
  "21": "Rio de Janeiro",
  "22": "Rio de Janeiro",
  "24": "Rio de Janeiro",
  "27": "Espírito Santo",
  "28": "Espírito Santo",
  "31": "Minas Gerais",
  "32": "Minas Gerais",
  "33": "Minas Gerais",
  "34": "Minas Gerais",
  "35": "Minas Gerais",
  "37": "Minas Gerais",
  "38": "Minas Gerais",
  "41": "Paraná",
  "42": "Paraná",
  "43": "Paraná",
  "44": "Paraná",
  "45": "Paraná",
  "46": "Paraná",
  "47": "Santa Catarina",
  "48": "Santa Catarina",
  "49": "Santa Catarina",
  "51": "Rio Grande do Sul",
  "53": "Rio Grande do Sul",
  "54": "Rio Grande do Sul",
  "55": "Rio Grande do Sul",
  "61": "Distrito Federal",
  "62": "Goiás",
  "63": "Tocantins",
  "64": "Goiás",
  "65": "Mato Grosso",
  "66": "Mato Grosso",
  "67": "Mato Grosso do Sul",
  "68": "Acre",
  "69": "Rondônia",
  "71": "Bahia",
  "73": "Bahia",
  "74": "Bahia",
  "75": "Bahia",
  "77": "Bahia",
  "79": "Sergipe",
  "81": "Pernambuco",
  "82": "Alagoas",
  "83": "Paraíba",
  "84": "Rio Grande do Norte",
  "85": "Ceará",
  "86": "Piauí",
  "87": "Pernambuco",
  "88": "Ceará",
  "89": "Piauí",
  "91": "Pará",
  "92": "Amazonas",
  "93": "Pará",
  "94": "Pará",
  "95": "Roraima",
  "96": "Amapá",
  "97": "Amazonas",
  "98": "Maranhão",
  "99": "Maranhão",
};

/** Capitais [longitude, latitude] — nomes iguais ao GeoJSON / dddList (para bolhas = total no estado). */
const STATE_CAPITAL_COORDS = {
  Acre: [-67.81, -9.97],
  Alagoas: [-35.73, -9.67],
  Amapá: [-51.07, 0.03],
  Amazonas: [-60.03, -3.1],
  Bahia: [-38.5, -12.97],
  Ceará: [-38.53, -3.72],
  "Distrito Federal": [-47.88, -15.78],
  "Espírito Santo": [-40.34, -20.32],
  Goiás: [-49.25, -16.68],
  Maranhão: [-44.3, -2.53],
  "Mato Grosso": [-56.1, -15.6],
  "Mato Grosso do Sul": [-54.65, -20.44],
  "Minas Gerais": [-43.94, -19.92],
  Pará: [-48.5, -1.46],
  Paraíba: [-34.86, -7.12],
  Paraná: [-49.27, -25.43],
  Pernambuco: [-34.88, -8.05],
  Piauí: [-42.8, -5.09],
  "Rio de Janeiro": [-43.17, -22.91],
  "Rio Grande do Norte": [-35.21, -5.79],
  "Rio Grande do Sul": [-51.23, -30.03],
  Rondônia: [-63.9, -8.76],
  Roraima: [-60.67, 2.82],
  "Santa Catarina": [-48.55, -27.6],
  "São Paulo": [-46.63, -23.55],
  Sergipe: [-37.07, -10.95],
  Tocantins: [-48.33, -10.17],
};

// ================= REDUCER =================

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    if (contact == null || contact.id == null) {
      return state;
    }
    const contactIndex = state.findIndex(
      (c) => String(c.id) === String(contact.id)
    );

    if (contactIndex !== -1) {
      const next = [...state];
      next[contactIndex] = contact;
      return next;
    }
    return [contact, ...state];
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  tabsBar: {
    ...adminShellTabBarMixin(theme),
    marginBottom: theme.spacing(1),
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  legendContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    margin: theme.spacing(0.5, 1.25),
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    marginRight: theme.spacing(0.75),
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.35)}`,
  },
  totalContactsBar: {
    background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.82)} 100%)`,
    padding: theme.spacing(1.5),
    textAlign: "center",
    color: theme.palette.primary.contrastText || "#fff",
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow:
      theme.palette.type === "dark"
        ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.25)}`
        : "0 4px 20px rgba(10, 22, 40, 0.1)",
  },
  legendCard: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: "none",
  },

  contactCard: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    height: "100%",
    border: `1px solid ${theme.palette.divider}`,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 4px 20px rgba(0,0,0,0.35)"
        : "0 2px 12px rgba(10, 22, 40, 0.08)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  cardAvatar: {
    marginRight: theme.spacing(2),
    width: 48,
    height: 48,
  },
  cardNumber: {
    color: theme.palette.text.secondary,
    fontSize: "0.85rem",
  },
  cardLabel: {
    fontSize: "0.8rem",
    fontWeight: 500,
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.primary,
  },
  mapStage: {
    borderRadius: theme.shape.borderRadius * 1.25,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(1),
    background:
      theme.palette.type === "dark"
        ? `radial-gradient(ellipse 95% 85% at 50% 42%, ${alpha("#00c8e8", 0.12)} 0%, #0f1b2e 42%, #05080c 100%)`
        : "linear-gradient(165deg, #e0f2fe 0%, #f0f9ff 35%, #f8fafc 100%)",
    boxShadow:
      theme.palette.type === "dark"
        ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.35)"
        : "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 28px rgba(10, 22, 40, 0.08)",
    overflow: "hidden",
  },
  mapSvgWrap: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor:
      theme.palette.type === "dark"
        ? alpha(theme.palette.background.paper, 0.35)
        : alpha("#ffffff", 0.65),
    border: `1px solid ${alpha(theme.palette.divider, theme.palette.type === "dark" ? 0.5 : 1)}`,
    padding: theme.spacing(1, 1, 0.5),
    overflow: "hidden",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  /** Evita que flex encolha o SVG a largura/altura 0 */
  mapChartHost: {
    width: "100%",
    minHeight: 320,
    lineHeight: 0,
    "& svg": {
      display: "block",
      width: "100% !important",
      maxWidth: "100%",
      height: "auto !important",
    },
  },
  mapMessageCenter: {
    minHeight: 320,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
  },
  mapHint: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(0.75),
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(0.75, 1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.text.secondary,
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  mapExplainer: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
  heatScaleBar: {
    height: 10,
    borderRadius: 5,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${theme.palette.primary.main} 100%)`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
  },
  heatScaleLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  cardFooter: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionsRight: {
    display: "flex",
    gap: theme.spacing(1),
  },
  actionBtnWhats: {
    backgroundColor: "#25D366",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#1ebe5b",
    },
  },
  actionBtnEdit: {
    backgroundColor: "#2196f3",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#1976d2",
    },
  },
  actionBtnBlock: {
    backgroundColor: "#ff9800",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#fb8c00",
    },
  },
  actionBtnDelete: {
    backgroundColor: "#f44336",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#e53935",
    },
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();

  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const [importContactModalOpen, setImportContactModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [ImportContacts, setImportContacts] = useState(null);

  const [blockingContact, setBlockingContact] = useState(null);
  const [unBlockingContact, setUnBlockingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exportContact, setExportContact] = useState(false);
  const [confirmChatsOpen, setConfirmChatsOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const fileUploadRef = useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const { setCurrentTicket } = useContext(TicketsContext);

  const [importWhatsappId, setImportWhatsappId] = useState();

  // SELEÇÃO EM MASSA
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [confirmDeleteManyOpen, setConfirmDeleteManyOpen] = useState(false);

  const { getAll: getAllSettings } = useCompanySettings();
  const [hideNum, setHideNum] = useState(false);
  const [enableLGPD, setEnableLGPD] = useState(false);

  // CONTROLE DE ABAS (CONTATOS / MAPA)
  const [tabValue, setTabValue] = useState(0);
  /** GeoJSON Feature[] — react-simple-maps com URL assume TopoJSON e quebra em Object.keys(.objects) */
  const [mapGeoFeatures, setMapGeoFeatures] = useState([]);
  const [mapGeoLoading, setMapGeoLoading] = useState(true);
  const [mapGeoError, setMapGeoError] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    let cancelled = false;
    setMapGeoLoading(true);
    setMapGeoError(false);
    (async () => {
      try {
        const feats = await fetchBrazilStateFeatures();
        if (cancelled) return;
        setMapGeoFeatures(feats);
        setMapGeoError(feats.length === 0);
      } catch (e) {
        if (!cancelled) {
          setMapGeoFeatures([]);
          setMapGeoError(true);
        }
      } finally {
        if (!cancelled) setMapGeoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      const settingList = await getAllSettings(user.companyId);
      for (const [key, value] of Object.entries(settingList)) {
        if (key === "enableLGPD") setEnableLGPD(value === "enabled");
        if (key === "lgpdHideNumber") setHideNum(value === "enabled");
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImportExcel = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileUploadRef.current.files[0]);
      await api.request({
        url: `/contacts/upload`,
        method: "POST",
        data: formData,
      });
      history.go(0);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setSelectedContactIds([]);
    setIsSelectAllChecked(false);
  }, [searchParam, selectedTags]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: {
              searchParam,
              pageNumber,
              contactTag: JSON.stringify(selectedTags),
            },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);

          const allCurrentContactIds = data.contacts.map((c) => c.id);
          const newSelected = selectedContactIds.filter((id) =>
            allCurrentContactIds.includes(id)
          );
          setSelectedContactIds(newSelected);
          setIsSelectAllChecked(
            newSelected.length === allCurrentContactIds.length &&
              allCurrentContactIds.length > 0
          );
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, selectedTags]);

  useEffect(() => {
    const companyId = user.companyId;
    const onContactEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
        setSelectedContactIds((prevSelected) =>
          prevSelected.filter((id) => id !== +data.contactId)
        );
      }
    };
    socket.on(`company-${companyId}-contact`, onContactEvent);

    return () => {
      socket.off(`company-${companyId}-contact`, onContactEvent);
    };
  }, [socket, user.companyId]);

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      handleSelectTicket(ticket);
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
  };

  const handleToggleSelectContact = (contactId) => (event) => {
    if (event.target.checked) {
      setSelectedContactIds((prevSelected) => [...prevSelected, contactId]);
    } else {
      setSelectedContactIds((prevSelected) =>
        prevSelected.filter((id) => id !== contactId)
      );
      setIsSelectAllChecked(false);
    }
  };

  const handleSelectAllContacts = (event) => {
    const checked = event.target.checked;
    setIsSelectAllChecked(checked);

    if (checked) {
      const allContactIds = contacts.map((contact) => contact.id);
      setSelectedContactIds(allContactIds);
    } else {
      setSelectedContactIds([]);
    }
  };

  const handleDeleteSelectedContacts = async () => {
    try {
      setLoading(true);
      await api.delete("/contacts/batch-delete", {
        data: { contactIds: selectedContactIds },
      });
      toast.success("Contatos selecionados deletados com sucesso!");
      setSelectedContactIds([]);
      setIsSelectAllChecked(false);
      setConfirmDeleteManyOpen(false);
      dispatch({ type: "RESET" });
      setPageNumber(1);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockContact = async (contactId) => {
    try {
      await api.put(`/contacts/block/${contactId}`, { active: false });
      dispatch({
        type: "UPDATE_CONTACTS",
        payload: { ...blockingContact, active: false },
      });
      toast.success("Contato bloqueado");
    } catch (err) {
      toastError(err);
    }
    setBlockingContact(null);
  };

  const handleUnBlockContact = async (contactId) => {
    try {
      await api.put(`/contacts/block/${contactId}`, { active: true });
      dispatch({
        type: "UPDATE_CONTACTS",
        payload: { ...unBlockingContact, active: true },
      });
      toast.success("Contato desbloqueado");
    } catch (err) {
      toastError(err);
    }
    setUnBlockingContact(null);
  };

  const onSave = (whatsappId) => {
    setImportWhatsappId(whatsappId);
  };

  const handleimportContact = async () => {
    setImportContactModalOpen(false);

    try {
      await api.post("/contacts/import", { whatsappId: importWhatsappId });
      history.go(0);
      setImportContactModalOpen(false);
    } catch (err) {
      toastError(err);
      setImportContactModalOpen(false);
    }
  };

  const handleimportChats = async () => {
    try {
      await api.post("/contacts/import/chats");
      history.go(0);
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  // ===== CONTAGEM POR ESTADO (DDD) — MEMOIZADO PARA O MAPA =====
  const stateCounts = useMemo(() => {
    const out = {};
    (contacts || []).forEach((contact) => {
      const number = contact.number;
      if (number && number.length > 4) {
        const ddd = number.substring(2, 4);
        if (dddList[ddd]) {
          const state = dddList[ddd];
          if (!out[state]) {
            out[state] = 0;
          }
          out[state] += 1;
        } else {
          if (!out.Outros) {
            out.Outros = 0;
          }
          out.Outros += 1;
        }
      }
    });
    return out;
  }, [contacts]);

  const maxStateCount = useMemo(
    () => Math.max(1, ...Object.values(stateCounts || {})),
    [stateCounts]
  );

  /** Nome do estado no GeoJSON = chave do dddList. Contatos antigos podem ter só "Distrito Federal/Goiás". */
  const countForGeoName = (geoName) => {
    const sc = stateCounts || {};
    const legacy = sc["Distrito Federal/Goiás"] || 0;
    if (geoName === "Distrito Federal") {
      return (sc[geoName] || 0) + legacy;
    }
    return sc[geoName] || 0;
  };

  /** Bolhas na capital: total de contatos inferidos por DDD naquele estado (não é GPS por pessoa). */
  const mapMarkers = useMemo(() => {
    const sc = stateCounts || {};
    const list = [];
    Object.entries(sc).forEach(([state, count]) => {
      if (!count || count < 1) return;
      if (state === "Outros") return;
      let coords = STATE_CAPITAL_COORDS[state];
      let label = state;
      if (!coords && state === "Distrito Federal/Goiás") {
        coords = STATE_CAPITAL_COORDS["Distrito Federal"];
        label = "DF/GO (legado)";
      }
      if (!coords) return;
      list.push({ key: state, label, count, coordinates: coords });
    });
    return list;
  }, [stateCounts]);

  return (
    <MainContainer className={classes.mainContainer}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
        onSave={(data) => dispatch({ type: "UPDATE_CONTACTS", payload: data })}
      />

      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t(
                "contacts.confirmationModal.deleteTitle"
              )} ${deletingContact.name}?`
            : blockingContact
            ? `Bloquear Contato ${blockingContact.name}?`
            : unBlockingContact
            ? `Desbloquear Contato ${unBlockingContact.name}?`
            : ImportContacts
            ? `${i18n.t("contacts.confirmationModal.importTitlte")}`
            : `${i18n.t("contactListItems.confirmationModal.importTitlte")}`
        }
        onSave={onSave}
        isCellPhone={ImportContacts}
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : blockingContact
            ? handleBlockContact(blockingContact.id)
            : unBlockingContact
            ? handleUnBlockContact(unBlockingContact.id)
            : ImportContacts
            ? handleimportContact()
            : handleImportExcel()
        }
      >
        {exportContact
          ? `${i18n.t("contacts.confirmationModal.exportContact")}`
          : deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : blockingContact
          ? `${i18n.t("contacts.confirmationModal.blockContact")}`
          : unBlockingContact
          ? `${i18n.t("contacts.confirmationModal.unblockContact")}`
          : ImportContacts
          ? `Escolha de qual conexão deseja importar`
          : `${i18n.t(
              "contactListItems.confirmationModal.importMessage"
            )}`}
      </ConfirmationModal>

      <ConfirmationModal
        title={`Tem certeza que deseja deletar ${selectedContactIds.length} contatos selecionados?`}
        open={confirmDeleteManyOpen}
        onClose={() => setConfirmDeleteManyOpen(false)}
        onConfirm={handleDeleteSelectedContacts}
      >
        Essa ação é irreversível.
      </ConfirmationModal>

      <ConfirmationModal
        title={i18n.t("contacts.confirmationModal.importChat")}
        open={confirmChatsOpen}
        onClose={setConfirmChatsOpen}
        onConfirm={(e) => handleimportChats()}
      >
        {i18n.t("contacts.confirmationModal.wantImport")}
      </ConfirmationModal>

      <MainHeader>
        <Title>
          {i18n.t("contacts.title")} ({contacts.length})
        </Title>
        <MainHeaderButtonsWrapper>
          <TagsFilter onFiltered={handleSelectedTags} />
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Button
                  variant="contained"
                  color="primary"
                  {...bindTrigger(popupState)}
                >
                  Importar / Exportar
                  <ArrowDropDown />
                </Button>
                <Menu {...bindMenu(popupState)}>
                  <MenuItem
                    onClick={() => {
                      setConfirmOpen(true);
                      setImportContacts(true);
                      popupState.close();
                    }}
                  >
                    <ContactPhone
                      fontSize="small"
                      color="primary"
                      style={{
                        marginRight: 10,
                      }}
                    />
                    {i18n.t("contacts.menu.importYourPhone")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setImportContactModalOpen(true);
                    }}
                  >
                    <Backup
                      fontSize="small"
                      color="primary"
                      style={{
                        marginRight: 10,
                      }}
                    />
                    {i18n.t("contacts.menu.importToExcel")}
                  </MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </PopupState>

          <Button
            variant="contained"
            onClick={() => setConfirmDeleteManyOpen(true)}
            disabled={selectedContactIds.length === 0 || loading}
            style={{
              marginRight: 8,
              backgroundColor: theme.palette.primary.main,
              color: "white",
            }}
          >
            Deletar Selecionados ({selectedContactIds.length})
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenContactModal}
          >
            {i18n.t("contacts.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      {importContactModalOpen && (
        <ContactImportWpModal
          isOpen={importContactModalOpen}
          handleClose={() => setImportContactModalOpen(false)}
          selectedTags={selectedTags}
          hideNum={hideNum}
          userProfile={user.profile}
        />
      )}

      {/* ABAS CONTATOS / MAPA */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="abas-contatos-mapa"
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        className={classes.tabsBar}
      >
        <Tab label="Contatos" />
        <Tab label="Mapa" />
      </Tabs>

      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <>
          <input
            style={{ display: "none" }}
            id="upload"
            name="file"
            type="file"
            accept=".xls,.xlsx"
            onChange={() => {
              setConfirmOpen(true);
            }}
            ref={fileUploadRef}
          />
        </>

        {/* ABA CONTATOS EM CARDS */}
        {tabValue === 0 && (
          <Box p={2}>
            {/* checkbox global "selecionar todos" */}
            <Box display="flex" alignItems="center" mb={2}>
              <Checkbox
                checked={isSelectAllChecked}
                onChange={handleSelectAllContacts}
                inputProps={{ "aria-label": "Selecionar todos os contatos" }}
              />
              <Typography variant="body2">
                Selecionar todos os contatos
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {contacts.map((contact) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={contact.id}>
                  <Card className={classes.contactCard}>
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box className={classes.cardHeader}>
                          <Avatar
                            src={`${contact?.urlPicture}`}
                            className={classes.cardAvatar}
                          />
                          <Box>
                            <Typography variant="subtitle1" gutterBottom>
                              {contact.name || "-"}
                            </Typography>
                            <Typography
                              variant="body2"
                              className={classes.cardNumber}
                            >
                              {enableLGPD && hideNum && user.profile === "user"
                                ? contact.isGroup
                                  ? contact.number
                                  : formatSerializedId(contact?.number) === null
                                  ? contact.number.slice(0, -6) +
                                    "**-**" +
                                    contact?.number.slice(-2)
                                  : formatSerializedId(
                                      contact?.number
                                    )?.slice(0, -6) +
                                    "**-**" +
                                    contact?.number?.slice(-2)
                                : contact.isGroup
                                ? contact.number
                                : formatSerializedId(contact?.number)}
                            </Typography>
                            {contact.email && (
                              <Typography
                                variant="body2"
                                className={classes.cardNumber}
                              >
                                {contact.email}
                              </Typography>
                            )}
                            {contact?.whatsapp?.name && (
                              <Typography
                                variant="body2"
                                className={classes.cardNumber}
                              >
                                Conexão: {contact?.whatsapp?.name}
                              </Typography>
                            )}
                            <Typography
                              variant="body2"
                              className={classes.cardLabel}
                            >
                              Status:{" "}
                              {contact.active ? (
                                <CheckCircleIcon
                                  style={{ color: "green", fontSize: 16 }}
                                />
                              ) : (
                                <CancelIcon
                                  style={{ color: "red", fontSize: 16 }}
                                />
                              )}
                            </Typography>
                          </Box>
                        </Box>

                        <Checkbox
                          checked={selectedContactIds.includes(contact.id)}
                          onChange={handleToggleSelectContact(contact.id)}
                          inputProps={{
                            "aria-label": `Selecionar contato ${contact.name}`,
                          }}
                        />
                      </Box>

                      <Box className={classes.cardFooter}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                          >
                            WhatsApp:
                          </Typography>
                        </Box>
                        <Box className={classes.actionsRight}>
                          <IconButton
                            size="small"
                            className={classes.actionBtnWhats}
                            disabled={!contact.active}
                            onClick={() => {
                              setContactTicket(contact);
                              setNewTicketModalOpen(true);
                            }}
                          >
                            {contact.channel === "whatsapp" && <WhatsApp />}
                            {contact.channel === "instagram" && <Instagram />}
                            {contact.channel === "facebook" && <Facebook />}
                          </IconButton>

                          <IconButton
                            size="small"
                            className={classes.actionBtnEdit}
                            onClick={() => hadleEditContact(contact.id)}
                          >
                            <EditIcon style={{ fontSize: 18 }} />
                          </IconButton>

                          <IconButton
                            size="small"
                            className={classes.actionBtnBlock}
                            onClick={
                              contact.active
                                ? () => {
                                    setConfirmOpen(true);
                                    setBlockingContact(contact);
                                  }
                                : () => {
                                    setConfirmOpen(true);
                                    setUnBlockingContact(contact);
                                  }
                            }
                          >
                            {contact.active ? (
                              <BlockIcon style={{ fontSize: 18 }} />
                            ) : (
                              <CheckCircleIcon style={{ fontSize: 18 }} />
                            )}
                          </IconButton>

                          <Can
                            role={user.profile}
                            perform="contacts-page:deleteContact"
                            yes={() => (
                              <IconButton
                                size="small"
                                className={classes.actionBtnDelete}
                                onClick={(e) => {
                                  setConfirmOpen(true);
                                  setDeletingContact(contact);
                                }}
                              >
                                <DeleteOutlineIcon style={{ fontSize: 18 }} />
                              </IconButton>
                            )}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {loading && (
              <Box mt={2}>
                <TableRowSkeleton avatar columns={6} />
              </Box>
            )}
          </Box>
        )}

        {/* ABA MAPA */}
        {tabValue === 1 && (
          <>
            <Box className={classes.totalContactsBar}>
              <Typography variant="h6" component="div" style={{ fontWeight: 700 }}>
                {(contacts || []).length}{" "}
                {(contacts || []).length === 1 ? "contato" : "contatos"} na base
              </Typography>
              <Typography variant="body2" style={{ opacity: 0.92, marginTop: 4 }}>
                Mapa por estado (estimativa pelo DDD do número do WhatsApp)
              </Typography>
            </Box>

            <Box p={3}>
              <Typography className={classes.mapExplainer} component="div">
                <strong>Porque existe este mapa?</strong> Ainda não temos endereço ou GPS por
                contato. O sistema estima o <strong>estado pelo DDD</strong> do número do
                WhatsApp (ex.: 11 → São Paulo). A <strong>cor do estado</strong> mostra o
                volume relativo; o <strong>número na capital</strong> é quantos contatos foram
                agrupados naquele estado. Não é a posição exata de cada pessoa.
              </Typography>

              <Card className={classes.legendCard}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    style={{ fontWeight: 600, textAlign: "center" }}
                  >
                    Estados com contatos
                  </Typography>
                  {Object.keys(stateCounts || {}).length === 0 ? (
                    <Typography variant="body2" color="textSecondary" align="center">
                      Nenhum número com DDD reconhecido ainda — o mapa mostra o Brasil
                      completo até haver dados.
                    </Typography>
                  ) : (
                    <Box className={classes.legendContainer}>
                      {Object.entries(stateCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([state, count]) => {
                          const t = count / maxStateCount;
                          const dotColor = alpha(
                            theme.palette.primary.main,
                            0.25 + 0.7 * t
                          );
                          return (
                            <Box key={state} className={classes.legendItem}>
                              <div
                                className={classes.legendColor}
                                style={{ backgroundColor: dotColor }}
                              />
                              <Typography variant="body2">
                                <strong>{state}</strong>: {count}{" "}
                                {count === 1 ? "contato" : "contatos"}
                              </Typography>
                            </Box>
                          );
                        })}
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Box className={classes.mapStage}>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
                >
                  Cor do estado = quantidade de contatos (mais forte = mais contatos)
                </Typography>
                <div className={classes.heatScaleBar} aria-hidden />
                <Box className={classes.heatScaleLabels}>
                  <span>0</span>
                  <span>
                    pico: {maxStateCount}{" "}
                    {maxStateCount === 1 ? "contato" : "contatos"}
                  </span>
                </Box>

                <Box className={classes.mapSvgWrap}>
                  {mapGeoLoading ? (
                    <Box className={classes.mapMessageCenter}>
                      <Typography color="textSecondary" align="center">
                        A carregar mapa do Brasil…
                      </Typography>
                    </Box>
                  ) : mapGeoError || mapGeoFeatures.length === 0 ? (
                    <Box className={classes.mapMessageCenter}>
                      <Typography color="textSecondary" align="center">
                        Não foi possível carregar o contorno dos estados. Confirme
                        que existe o ficheiro{" "}
                        <code style={{ fontSize: "0.85em" }}>public/geo/brazil-states.geojson</code>{" "}
                        ou a ligação à internet para os espelhos CDN.
                      </Typography>
                    </Box>
                  ) : (
                    <Box className={classes.mapChartHost}>
                      <ComposableMap
                        key={`br-map-${mapGeoFeatures.length}`}
                        projection="geoMercator"
                        projectionConfig={{
                          scale: 720,
                          center: [-54, -14.25],
                        }}
                        width={960}
                        height={560}
                        style={{
                          width: "100%",
                          maxWidth: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      >
                        <ZoomableGroup
                          center={[-54, -14.25]}
                          zoom={0.88}
                          minZoom={0.45}
                          maxZoom={6}
                        >
                          <Geographies geography={mapGeoFeatures}>
                            {({ geographies }) =>
                              (geographies || []).map((geo) => {
                              const stateName =
                                geo.properties && geo.properties.name
                                  ? geo.properties.name
                                  : "";
                              const count = countForGeoName(stateName);
                              const isDark = theme.palette.type === "dark";
                              const t = count / maxStateCount;
                              const primary = theme.palette.primary.main;
                              const fillEmpty = isDark
                                ? alpha("#152536", 0.95)
                                : alpha("#ffffff", 0.9);
                              const fillData =
                                count > 0
                                  ? alpha(primary, 0.2 + 0.62 * t)
                                  : fillEmpty;
                              const strokeBase = isDark
                                ? alpha(primary, 0.42)
                                : alpha("#0a1628", 0.2);
                              const strokeHover = isDark
                                ? alpha("#7dd3fc", 0.95)
                                : alpha(primary, 0.85);
                              const fillHover =
                                count > 0
                                  ? alpha(primary, 0.32 + 0.55 * t)
                                  : isDark
                                  ? alpha("#1e2d40", 0.98)
                                  : alpha("#e2e8f0", 1);

                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  aria-label={`${stateName}: ${count} contato${
                                    count === 1 ? "" : "s"
                                  }`}
                                  style={{
                                    default: {
                                      outline: "none",
                                      fill: fillData,
                                      stroke: strokeBase,
                                      strokeWidth: 0.55,
                                      transition:
                                        "fill 0.18s ease, stroke 0.18s ease",
                                    },
                                    hover: {
                                      outline: "none",
                                      fill: fillHover,
                                      stroke: strokeHover,
                                      strokeWidth: 0.9,
                                    },
                                    pressed: {
                                      outline: "none",
                                      fill: fillHover,
                                      stroke: strokeHover,
                                      strokeWidth: 0.9,
                                    },
                                  }}
                                />
                              );
                            })
                            }
                          </Geographies>
                          {mapMarkers.map(({ key, label, count, coordinates }) => {
                            const r = 6 + Math.min(13, Math.sqrt(count) * 1.15);
                            const fill = theme.palette.primary.main;
                            const strokePaper = theme.palette.background.paper;
                            const txt =
                              count > 999 ? "999+" : String(count);
                            return (
                              <Marker key={`m-${key}`} coordinates={coordinates}>
                                <g>
                                  <circle
                                    r={r}
                                    fill={fill}
                                    stroke={strokePaper}
                                    strokeWidth={1.6}
                                    opacity={0.95}
                                  />
                                  <text
                                    textAnchor="middle"
                                    y={r > 11 ? 4 : 3}
                                    style={{
                                      fontFamily: theme.typography.fontFamily,
                                      fill:
                                        theme.palette.primary.contrastText ||
                                        "#ffffff",
                                      fontSize: count > 99 ? 8.5 : 10.5,
                                      fontWeight: 700,
                                      pointerEvents: "none",
                                    }}
                                  >
                                    {txt}
                                  </text>
                                  <title>{`${label}: ${count} contato${
                                    count === 1 ? "" : "s"
                                  }`}</title>
                                </g>
                              </Marker>
                            );
                          })}
                        </ZoomableGroup>
                      </ComposableMap>
                    </Box>
                  )}
                </Box>

                <Typography component="div" className={classes.mapHint}>
                  Arraste / zoom · cores = volume por estado (DDD) · bolha na capital =
                  total de contatos naquele estado
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Contacts;
