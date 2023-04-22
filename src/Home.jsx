import { Button, Container, Grid, Input, Typography, Paper, createTheme, ThemeProvider, Box } from "@mui/material";
import { invoke, } from "@tauri-apps/api/tauri"
import { useState } from "react"

const theme = createTheme({
    typography: {
        allVariants: {
            fontFamily: 'Space Grotesk',
            textTransform: 'none',
        },
    },
});

const textViewStyle = {
    width: "100%",
    minHeight: 200,
    maxHeight: 200,
    overflowY: "scroll",
    backgroundColor: "#23272A",
    color: "white"
};

const outputViewStyle = {
    width: "100%",
    minHeight: "100%",
    maxHeight: "100%",
    overflowY: "scroll",
    backgroundColor: "#23272A",
    color: "white"
};

const checkButtonStyle = {
    backgroundColor: "#5865F2",
    marginTop: 1
};

export default function Home() {
    const [result, setResult] = useState("");
    const [fileA, setFileA] = useState();
    const [fileB, setFileB] = useState();
    const [highlighted, setHighlighted] = useState();
    function hightlight(text, indices) {
        let output = [""];
        for (let i = 0; i <= text.length; i++) {
            if (indices.findIndex((x) => x === i) != -1) {
                output.push((<b>{text[i]}</b>));
            } else {
                output.push((<>{text[i]}</>));
            }
        }
        console.log(output)
        return output;
    }
    async function checkPlagiarism() {
        console.log(fileA);
        console.log(fileB);
        let rslt = await invoke("check_plagiarism", { fileA, fileB });
        setResult(rslt)
        console.log(rslt);
        console.log("test ", hightlight(fileA, rslt.idx));
        setHighlighted(hightlight(rslt.content_a, rslt.idx));
        //setFileB(rslt.content_b);
    }

    async function readText(event, type) {
        const file = event.target.files.item(0)
        const text = await file.text();
        if (type === "a") {
            setFileA(text);
        } else {
            setFileB(text);
        }

        console.log("?? ", text, fileA, fileB, type);
    }
    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Grid container justifyContent={"center"} >
                    <Box sx={{ m: 1 }} >
                        <Typography variant="h3" > Plagiarism Checker </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item lg={6} xs={6} md={6} xl={6}><Typography variant="h5"> Source</Typography></Grid>
                        <Grid item lg={6} xs={6} md={6} xl={6}><Typography variant="h5"> Desitination</Typography></Grid>
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid item lg={6} xs={6} md={6} xl={6}>
                            <Button variant="contained" component="label" color="error">
                                Choose file
                                <input type="file" id="file_a" onChange={async (e) => await readText(e, "a")} hidden />
                            </Button>
                        </Grid>
                        <Grid item lg={6} xs={6} md={6} xl={6}>
                            <Button variant="contained" component="label" color="success">
                                Choose file
                                <input type="file" id="file_b" onChange={async (e) => await readText(e, "b")} hidden />
                            </Button>
                        </Grid>
                    </Grid>

                    <Box marginTop={1} >
                        <Grid container spacing={2}>
                            <Grid item lg={6} xs={6} md={6} xl={6}>
                                <Paper sx={textViewStyle} >
                                    {fileA ? (
                                        <Typography variant="subtitle">
                                            {fileA}
                                        </Typography>
                                    ) : (<></>)}
                                </Paper>
                            </Grid>
                            <Grid item lg={6} xs={6} md={6} xl={6}>
                                <Paper sx={textViewStyle} >
                                    {fileB ? (
                                        <Typography variant="subtitle">
                                            {fileB}
                                        </Typography>
                                    ) : (<></>)}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>

                    <Button onClick={checkPlagiarism} sx={checkButtonStyle} size="large" variant="contained" fullWidth > Check </Button>

                    <Box marginTop={1} >
                        <Grid container spacing={2}>
                            <Grid item lg={12} xs={12} md={12} xl={12} >
                                <Paper raised style={outputViewStyle}>
                                    <Typography variant="h5" color={"lightgreen"}>
                                        {highlighted}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                    {result != "" ? (
                        <Box marginTop={1} >
                            <Typography variant="h4" color={"#EB459E"}>Percentage: {result.percentage} %</Typography>
                        </Box>) : ""}

                </Grid>
            </Container>
        </ThemeProvider>
    )
}