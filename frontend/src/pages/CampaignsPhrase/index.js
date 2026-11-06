import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";

import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { usePageListLayoutStyles } from "../../theme/pageListLayoutStyles";
import { useStandardDataListStyles } from "../../theme/standardDataListStyles";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import AddCircle from "@material-ui/icons/AddCircle";
import TextFields from "@material-ui/icons/TextFields";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Can } from "../../components/Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import CampaignModalPhrase from "../../components/CampaignModalPhrase";
const CampaignsPhrase = () => {
  const layout = usePageListLayoutStyles();
  const list = useStandardDataListStyles();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);

  const [campaignflows, setCampaignFlows] = useState([]);
  const [ModalOpenPhrase, setModalOpenPhrase] = useState(false);
  const [campaignflowSelected, setCampaignFlowSelected] = useState();

  const handleDeleteCampaign = async campaignId => {
    try {
      await api.delete(`/flowcampaign/${campaignId}`);
      toast.success("Frase deletada");
      setConfirmModalOpen(false);
      setDeletingContact(null);
      getCampaigns();
    } catch (err) {
      toastError(err);
    }
  };

  const getCampaigns =  async() => {
    setLoading(true);
    await api.get("/flowcampaign").then(res => {
      setCampaignFlows(res.data.flow);
      setLoading(false);
    });
  };

  const onSaveModal = () => {
    getCampaigns()
  }

  useEffect(() => {
    getCampaigns();
  }, []);

  return (
    <MainContainer className={layout.pageRoot}>
      <ConfirmationModal
        title={
          deletingContact &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${
            deletingContact.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCampaign(deletingContact.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <CampaignModalPhrase
        open={ModalOpenPhrase}
        onClose={() => setModalOpenPhrase(false)}
        FlowCampaignId={campaignflowSelected}
        onSave={onSaveModal}
      />
      <MainHeader>
        <Title>Campanhas</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setCampaignFlowSelected();
              setModalOpenPhrase(true);
            }}
          >
            <Box display="flex" alignItems="center" style={{ gap: 8 }}>
              <AddCircle fontSize="small" />
              Campanha
            </Box>
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={layout.mainPaper}
        variant="outlined"
      >
        <Table size="small" className={list.standardTable}>
          <TableHead>
            <TableRow className={list.headRow}>
              <TableCell>Nome</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">{i18n.t("contacts.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading &&
              campaignflows.map((flow) => (
                <TableRow key={flow.id} className={list.bodyRow} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                      <TextFields fontSize="small" color="action" />
                      <span>{flow.name}</span>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {flow.status ? "Ativo" : "Desativado"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setCampaignFlowSelected(flow.id);
                        setModalOpenPhrase(true);
                      }}
                      aria-label="editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <Can
                      role={user.profile}
                      perform="contacts-page:deleteContact"
                      yes={() => (
                        <IconButton
                          size="small"
                          aria-label="excluir"
                          onClick={() => {
                            setConfirmModalOpen(true);
                            setDeletingContact(flow);
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
            py={3}
          >
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </MainContainer>
  );
};

export default CampaignsPhrase;
