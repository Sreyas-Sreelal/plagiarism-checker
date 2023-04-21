import { Button, Card, Container, Grid, Input, Typography } from "@mui/material";
import { invoke, } from "@tauri-apps/api/tauri"
import { useState } from "react"

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

        <Container sx={{ justifyContent: "center", display: "block" }}>
            <Typography variant="h4" textAlign={"center"} > Plagiarism Checker </Typography>
            <Grid container spacing={2}>
                <Grid item lg={6} xs={6} md={6} xl={6}><Typography variant="h5"> Source</Typography></Grid>
                <Grid item lg={6} xs={6} md={6} xl={6}><Typography variant="h5"> Desitination</Typography></Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item lg={6} xs={6} md={6} xl={6}><Input type="file" id="file_a" onChange={async (e) => await readText(e, "a")} /></Grid>
                <Grid item lg={6} xs={6} md={6} xl={6}><Input type="file" id="file_b" onChange={async (e) => await readText(e, "b")} /></Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
                <Grid item lg={6} xs={6} md={6} xl={6}>
                    {fileA ? (
                        <Card style={{ width: "100%", minHeight: 200, maxHeight: 200, overflowY: "scroll" }} >
                            <Typography variant="caption">
                                {fileA}
                            </Typography>
                        </Card>) : (<></>)}
                </Grid>


                <Grid item lg={6} xs={6} md={6} xl={6}>
                    {fileB ? (
                        <Card style={{ width: "100%", minHeight: 200, maxHeight: 200, overflowY: "scroll" }} >
                            <Typography variant="caption">
                                {fileB}
                            </Typography>
                        </Card>) : (<></>)}
                </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
                <Grid item lg={4} xs={4} md={4} xl={4} />
                <Grid item lg={4} xs={4} md={4} xl={4} >
                    <Button onClick={checkPlagiarism} variant="contained" fullWidth> check </Button>
                </Grid>
                <Grid item lg={4} xs={4} md={4} xl={4} />
            </Grid>

            <br />
            <Grid container spacing={2}>
                <Grid item lg={12} xs={12} md={12} xl={12} >
                    <Card raised style={{ width: "100%", minHeight: 100, maxHeight: 100, overflowY: "scroll" }}> <Typography variant="caption" color={"darkgreen"}>{highlighted}</Typography></Card>
                </Grid>

            </Grid>
            {result != "" ? (
                <>
                    <Typography variant="h4" textAlign={"center"} color={"red"}>Percentage: {result.percentage} %</Typography>
                </>) : ""}
        </Container>

    )
}