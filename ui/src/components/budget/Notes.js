import { useContext, useState } from "react";
import { AppContext } from "../../AppContext";
import AddNoteModal from "./AddNoteModal";
import ClearIcon from "@mui/icons-material/Clear";
import "./Notes.css";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import axios from "axios";
import {
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";

export default function Notes() {
  let { date } = useContext(AppContext);
  let { budgetRefresh, setBudgetRefresh } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let { notes } = useContext(AppContext);
  let [openAddNote, setOpenAddNote] = useState(true);

  const handleAddNote = () => setOpenAddNote(true);

  async function deleteNote(id) {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    let payload = {
      params: {
        month,
        year,
        id,
      },
    };
    try{
      let res = await axios.delete(`http://localhost:3001/notes`, payload);
      setSnackbarSuccess(true)
      return res.data;
    } catch (err) {
      setSnackbarError(true)
    }
  }

  const handleDeleteNote = (id) => {
    deleteNote(id).then(() => {
      setReason('note')
      setBudgetRefresh(!budgetRefresh);
    })
  };

  return (
    <>
      {date ? (
        <>
          <AddNoteModal
            open={openAddNote}
            setOpen={setOpenAddNote}
          />
          <Grid container>
            <Grid item xs={12}>
              <Button onClick={handleAddNote} className="add-note-button">
                <AddCircleOutline className="add-note-icon" />
                <Typography component = {'span'}>Add Note</Typography>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Grid container justifyContent="center" spacing={4}>
                {notes.map((note) => {
                  return (
                    <Grid item xs={3}>
                      <Card style={{ marginTop: "50px" }}>
                        <CardHeader
                          title={note.title}
                          action={
                            <IconButton
                              onClick={() =>
                                handleDeleteNote(
                                  note.note_id
                                )
                              }
                            >
                              <ClearIcon />
                            </IconButton>
                          }
                        ></CardHeader>
                        <Divider variant="middle" />
                        <CardContent>
                          <Grid container justifyContent="center">
                            <Grid item xs={12}>
                              <Typography component = {'span'} variant="h6" align="center">
                                {note.details}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        <Typography component = {'span'} style={{ color: "#FFF" }}>
          Please Select a Budget Month
        </Typography>
      )}
    </>
  );
}
