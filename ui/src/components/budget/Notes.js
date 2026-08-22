import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import AddNoteModal from "./AddNoteModal";
import ClearIcon from "@mui/icons-material/Clear";
import "./Notes.css";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { removeNote } from "../../state/notesSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
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
  const dispatch = useDispatch();
  const date = useSelector((state) => state.budget.date);
  const notes = useSelector((state) => state.notes.items);
  let [openAddNote, setOpenAddNote] = useState(false);

  const handleAddNote = () => setOpenAddNote(true);

  const handleDeleteNote = (id) => {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    dispatch(removeNote({ id, month, year }))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
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
