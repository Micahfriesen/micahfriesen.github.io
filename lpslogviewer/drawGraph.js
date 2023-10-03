let u; // internal variable for graph

const timeStamp = [];
const accelData = [];
const baroData = [];
const accelSpeed = [];
const baroSpeed = [];

let accelScaleMax = 0;
let accelScaleMin = 0;

let baroScaleMax = 0;
let baroScaleMin = 0;

let speedScaleMax = 0;
let speedScaleMin = 0;

let scaleMax = 0;
let scaleMin = 0;

const AccelHeader = [];
const BaroHeader = [];
const AccelSpeedHeader = [];
const BaroSpeedHeader = [];

const FileName = [];

function wheelZoomPlugin(opts) {
    let factor = opts.factor || 0.75;

    let xMin, xMax, yMin, yMax, xRange, yRange;

    function clamp(nRange, nMin, nMax, fRange, fMin, fMax) {
        if (nRange > fRange) {
            nMin = fMin;
            nMax = fMax;
        }
        else if (nMin < fMin) {
            nMin = fMin;
            nMax = fMin + nRange;
        }
        else if (nMax > fMax) {
            nMax = fMax;
            nMin = fMax - nRange;
        }

        return [nMin, nMax];
    }

    return {
        hooks: {
            ready: u => {
                xMin = u.scales.x.min;
                xMax = u.scales.x.max;
                yMin = u.scales.y.min;
                yMax = u.scales.y.max;

                xRange = xMax - xMin;
                yRange = yMax - yMin;

                let over = u.over;
                let rect = over.getBoundingClientRect();

                // wheel drag pan
                over.addEventListener("mousedown", e => {
                    if (e.button == 0) {
                        //	plot.style.cursor = "move";
                        e.preventDefault();

                        let left0 = e.clientX;
                        //	let top0 = e.clientY;

                        let scXMin0 = u.scales.x.min;
                        let scXMax0 = u.scales.x.max;

                        let xUnitsPerPx = u.posToVal(1, 'x') - u.posToVal(0, 'x');

                        function onmove(e) {
                            e.preventDefault();

                            let left1 = e.clientX;
                            //	let top1 = e.clientY;

                            let dx = xUnitsPerPx * (left1 - left0);

                            u.setScale('x', {
                                min: scXMin0 - dx,
                                max: scXMax0 - dx,
                            });
                        }

                        function onup(e) {
                            document.removeEventListener("mousemove", onmove);
                            document.removeEventListener("mouseup", onup);
                        }

                        document.addEventListener("mousemove", onmove);
                        document.addEventListener("mouseup", onup);
                    }
                });

                // wheel scroll zoom
                over.addEventListener("wheel", e => {
                    e.preventDefault();
                    let { left, top } = u.cursor;

                    let leftPct = left / rect.width;
                    let btmPct = 1 - top / rect.height;
                    let xVal = u.posToVal(left, "x");
                    let yVal = u.posToVal(top, "y");
                    let oxRange = u.scales.x.max - u.scales.x.min;
                    let oyRange = u.scales.y.max - u.scales.y.min;

                    let nxRange = e.deltaY < 0 ? oxRange * factor : oxRange / factor;
                    let nxMin = xVal - leftPct * nxRange;
                    let nxMax = nxMin + nxRange;
                    [nxMin, nxMax] = clamp(nxRange, nxMin, nxMax, xRange, xMin, xMax);

                    //let nyRange = e.deltaY < 0 ? oyRange * factor : oyRange / factor;
                    let nyRange = oyRange;
                    //let nyRange = 300;
                    let nyMin = yVal - btmPct * nyRange;
                    let nyMax = nyMin + nyRange;
                    [nyMin, nyMax] = clamp(nyRange, nyMin, nyMax, yRange, yMin, yMax);

                    u.batch(() => {
                        u.setScale("x", {
                            min: nxMin,
                            max: nxMax,
                        });

                        u.setScale("y", {
                            min: nyMin,
                            max: nyMax,
                        });
                    });
                });
            }
        }
    };
}

function getSize() {
    return {
        width: window.innerWidth - 100,
        height: window.innerHeight - 100,
    }
}
function drawGraph(csvFile) {

    AccelHeader.length = 0;
    BaroHeader.length = 0;
    AccelSpeedHeader.length = 0;
    BaroSpeedHeader.length = 0;
    timeStamp.length = 0;
    accelData.length = 0;
    baroData.length = 0;
    accelSpeed.length = 0;
    baroSpeed.length = 0;

    accelScaleMax = 0;
    accelScaleMin = 0;
    baroScaleMax = 0;
    baroScaleMin = 0;
    speedScaleMax = 0;
    speedScaleMin = 0;
    scaleMax = 0;
    scaleMin = 0;

    AccelHeader.push(csvFile.data[0][1]);
    BaroHeader.push(csvFile.data[0][2]);
    AccelSpeedHeader.push(csvFile.data[0][3]);
    BaroSpeedHeader.push(csvFile.data[0][4]);

    for (i = 1; i < csvFile.data.length; i++) {
        //timeStamp.push(csvFile.data[i][0]/1000)
        timeStamp.push(i)

        accelData.push(parseFloat(csvFile.data[i][1]))
        //get axis max
        parseInt(csvFile.data[i][1]) > 0 && parseInt(csvFile.data[i][1]) > accelScaleMax ? accelScaleMax = parseInt(csvFile.data[i][1]) : accelScaleMax = accelScaleMax;
        parseInt(csvFile.data[i][1]) < 0 && parseInt(csvFile.data[i][1]) < accelScaleMin ? accelScaleMin = parseInt(csvFile.data[i][1]) : accelScaleMin = accelScaleMin;
        //get global max
        parseInt(csvFile.data[i][1]) > 0 && parseInt(csvFile.data[i][1]) > scaleMax ? scaleMax = parseInt(csvFile.data[i][1]) : scaleMax = scaleMax;
        parseInt(csvFile.data[i][1]) < 0 && parseInt(csvFile.data[i][1]) < scaleMin ? scaleMin = parseInt(csvFile.data[i][1]) : scaleMin = scaleMin;

        baroData.push(parseFloat(csvFile.data[i][2]))
        //get axis max
        parseInt(csvFile.data[i][2]) > 0 && parseInt(csvFile.data[i][2]) > baroScaleMax ? baroScaleMax = parseInt(csvFile.data[i][2]) : baroScaleMax = baroScaleMax;
        parseInt(csvFile.data[i][2]) < 0 && parseInt(csvFile.data[i][2]) < baroScaleMin ? baroScaleMin = parseInt(csvFile.data[i][2]) : baroScaleMin = baroScaleMin;
        //get global max
        parseInt(csvFile.data[i][2]) > 0 && parseInt(csvFile.data[i][2]) > scaleMax ? scaleMax = parseInt(csvFile.data[i][2]) : scaleMax = scaleMax;
        parseInt(csvFile.data[i][2]) < 0 && parseInt(csvFile.data[i][2]) < scaleMin ? scaleMin = parseInt(csvFile.data[i][2]) : scaleMin = scaleMin;

        accelSpeed.push(parseFloat(csvFile.data[i][3]))
        //get axis max
        parseInt(csvFile.data[i][3]) > 0 && parseInt(csvFile.data[i][3]) > speedScaleMax ? speedScaleMax = parseInt(csvFile.data[i][3]) : speedScaleMax = speedScaleMax;
        parseInt(csvFile.data[i][3]) < 0 && parseInt(csvFile.data[i][3]) < speedScaleMin ? speedScaleMin = parseInt(csvFile.data[i][3]) : speedScaleMin = speedScaleMin;
        //get global max
        parseInt(csvFile.data[i][3]) > 0 && parseInt(csvFile.data[i][3]) > scaleMax ? scaleMax = parseInt(csvFile.data[i][3]) : scaleMax = scaleMax;
        parseInt(csvFile.data[i][3]) < 0 && parseInt(csvFile.data[i][3]) < scaleMin ? scaleMin = parseInt(csvFile.data[i][3]) : scaleMin = scaleMin;

        baroSpeed.push(parseFloat(csvFile.data[i][4]))
        //get axis max
        parseInt(csvFile.data[i][4]) > 0 && parseInt(csvFile.data[i][4]) > speedScaleMax ? speedScaleMax = parseInt(csvFile.data[i][4]) : speedScaleMax = speedScaleMax;
        parseInt(csvFile.data[i][4]) < 0 && parseInt(csvFile.data[i][4]) < speedScaleMin ? speedScaleMin = parseInt(csvFile.data[i][4]) : speedScaleMin = speedScaleMin;
        //get global max
        parseInt(csvFile.data[i][4]) > 0 && parseInt(csvFile.data[i][4]) > scaleMax ? scaleMax = parseInt(csvFile.data[i][4]) : scaleMax = scaleMax;
        parseInt(csvFile.data[i][4]) < 0 && parseInt(csvFile.data[i][4]) < scaleMin ? scaleMin = parseInt(csvFile.data[i][4]) : scaleMin = scaleMin;

    };
    accelScaleMin = accelScaleMax * scaleMin / scaleMax;
    baroScaleMin = baroScaleMax * scaleMin / scaleMax;
    speedScaleMin = speedScaleMax * scaleMin / scaleMax;
    chartDataReady(0)
    console.log("accel", accelScaleMax, accelScaleMin)
    console.log("baro", baroScaleMax, baroScaleMin)
    console.log("speed", speedScaleMax, speedScaleMin)
    console.log("glob", scaleMax, scaleMin)
}

function chartDataReady(isnew) {
    const data = [
        timeStamp,
        accelData,
        baroData,
        accelSpeed,
        baroSpeed,
    ];

    let opts = {
        id: "graph",
        title: FileName,
        ...getSize(),
        padding: [50, 50, 50, 50],
        plugins: [
            wheelZoomPlugin({ factor: .9 }),
        ],
        //Series
        series: [
            {
                scale: "x",
                label: "TimeStamp",
            },
            {
                scale: "G",
                label: AccelHeader,
                stroke: "green",
            },
            {
                scale: "ft",
                label: BaroHeader,
                stroke: "blue",
            },
            {
                scale: "mph",
                label: AccelSpeedHeader,
                stroke: "red",
            },
            {
                scale: "accelMph",
                label: BaroSpeedHeader,
                stroke: "purple ",
            },
        ],
        // Axes
        axes: [
            {
                scale: "x",
                label: "X Axis Label",
                labelSize: 20,
                grid: {
                    show: true,
                    stroke: "rgb(220, 220, 220)",
                    width: 2,
                    dash: [10, 5],
                },
            },
            {
                scale: "G",
                space: 30,
                side: 3,
                label: "temp",
                labelGap: 4,
                labelSize: 4 + 12 + 4,
                stroke: "green",
                grid: {
                    show: false,
                },
            },
            {
                scale: "ft",
                space: 30,
                side: 3,
                label: "output",
                labelGap: 4,
                labelSize: 4 + 12 + 4,
                stroke: "blue",
                grid: {
                    show: true,
                    stroke: "rgb(200, 200, 200)",
                    width: 2,
                    dash: [10, 5],
                },
            },
            {
                scale: "mph",
                space: 30,
                side: 1,
                label: "error",
                labelGap: 4,
                labelSize: 4 + 12 + 4,
                stroke: "purple",
                grid: {
                    show: false,
                    stroke: "rgb(200, 200, 200)",
                    width: 2,
                    dash: [10, 5],
                },
            },
            {
                //show: false,
                scale: "accelMph",
                space: 30,
                side: 1,
                label: "iState",
                labelGap: 4,
                labelSize: 4 + 12 + 4,
                stroke: "red",
                grid: {
                    show: false,
                },
            },
        ],
        scales: {
            x: {
                time: false,
            },
            y: {
                auto: false,
            },
            "G": {
                auto: true,
                /*range: (u, dataMin, dataMax) => {
                    let [min, max] = uPlot.rangeNum(accelScaleMin, accelScaleMax, 0.4, true);
                    return [
                        Math.min(0, min),
                        Math.max(0, max),
                    ];
                }*/
            },
            "ft": {
                auto: true,
                /*range: (u, dataMin, dataMax) => {
                    let [min, max] = uPlot.rangeNum(baroScaleMin, baroScaleMax, 0.1, true);
                    return [
                        Math.min(0, min),
                        Math.max(0, max),
                    ];
                }*/
            },
            "mph": {
                auto: true,
                /*range: (u, dataMin, dataMax) => {
                    let [min, max] = uPlot.rangeNum(speedScaleMin, speedScaleMax, 0.1, true);
                    return [
                        Math.min(0, min),
                        Math.max(0, max),
                    ];
                }*/
            },
            "accelMph": {
                auto: true,
                /*range: (u, dataMin, dataMax) => {
                    let [min, max] = uPlot.rangeNum(speedScaleMin, speedScaleMax, 0.1, true);
                    return [
                        Math.min(0, min),
                        Math.max(0, max),
                    ];
                }*/
            },
        },
        cursor: {
            drag: {
                setScale: false,
            },
        },
        select: {
            show: false,
        },


    };
    if (u != null) {
        const element = document.getElementById("graph");
        element.remove();
    }
    u= new uPlot(opts, data, document.body);
    function throttle(cb, limit) {
        var wait = false;

        return () => {
            if (!wait) {
                requestAnimationFrame(cb);
                wait = true;
                setTimeout(() => {
                    wait = false;
                }, limit);
            }
        }
    }
    window.addEventListener("resize", e => {
        u.setSize(getSize());
    });
}

function openFile() {
    document.getElementById('inp').click();
}
function readFile(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.fileName = file.name
    reader.onload = function (e) {
        document.getElementById('contents').innerHTML = e.target.result;
    }
    FileName.length = 0;
    FileName.push(file.name);
    console.log(FileName)
    Papa.parse(file, {
        header: false,
        quotes: false,
        skipEmptyLines: true,
        columns: null,
        complete: function (dataFile) {
            drawGraph(dataFile);
        }
    });
}