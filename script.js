"use strict";

/* ============================================================
   NOTACIÓN CIENTÍFICA
   Autor: Samuel López Melián
============================================================ */

/* ------------------------------------------------------------
   DECIMAL → NOTACIÓN CIENTÍFICA: 10 ejercicios
------------------------------------------------------------ */

const scientific = [
    "657",
    "0.00058",
    "12580000000",
    "0.0021",
    "12",
    "0.00000012",
    "78000000000",
    "3650000",
    "0.000025",
    "325900000000"
];

/* ------------------------------------------------------------
   NOTACIÓN CIENTÍFICA → DECIMAL: 10 ejercicios
------------------------------------------------------------ */

const decimals = [
    ["5.64", -6],
    ["7.00", 12],
    ["3.40", -4],
    ["6.50", 7],
    ["2.01", -7],
    ["2.00", -2],
    ["2.33", 4],
    ["3.623", -3],
    ["5.07", 2],
    ["1.5314", 6]
];

/* ------------------------------------------------------------
   VARIABLES Y ELEMENTOS
------------------------------------------------------------ */

const $ = id => document.getElementById(id);

let mode = "science";
let index = 0;
let completionDate = null;
let advanceTimer = null;

/* ------------------------------------------------------------
   OPERACIONES EXACTAS CON LAS CIFRAS
------------------------------------------------------------ */

function normalize(raw) {
    const text = String(raw)
        .trim()
        .replace(/−/g, "-")
        .replace(",", ".");

    if (!/^\+?\d+(?:\.\d+)?$/.test(text)) {
        return null;
    }

    const parts = text.replace(/^\+/, "").split(".");

    let digits = (parts[0] + (parts[1] || ""))
        .replace(/^0+/, "");

    let power = -(parts[1] || "").length;

    if (!digits) {
        return {
            digits: "0",
            power: 0
        };
    }

    while (digits.endsWith("0")) {
        digits = digits.slice(0, -1);
        power++;
    }

    return { digits, power };
}

function scientificOf(raw) {
    const number = normalize(raw);

    const exponent =
        number.digits.length - 1 + number.power;

    const coefficient =
        number.digits[0] +
        (number.digits.length > 1
            ? "." + number.digits.slice(1)
            : "");

    return { coefficient, exponent };
}

function expand(coefficient, exponent) {
    const number = normalize(coefficient);

    const position =
        number.digits.length + number.power + exponent;

    if (position <= 0) {
        return "0." +
            "0".repeat(-position) +
            number.digits;
    }

    if (position >= number.digits.length) {
        return number.digits +
            "0".repeat(position - number.digits.length);
    }

    return number.digits.slice(0, position) +
        "." +
        number.digits.slice(position);
}

function display(value) {
    return String(value).replace(".", ",");
}

function items() {
    return mode === "science" ? scientific : decimals;
}

function blockTitle() {
    return mode === "science"
        ? "De decimal a notación científica"
        : "De notación científica a decimal";
}

/* ------------------------------------------------------------
   MOSTRAR EL EJERCICIO
------------------------------------------------------------ */

function render() {
    const total = items().length;
    const finished = index === total;

    $("exercise").hidden = finished;
    $("finish").hidden = !finished;

    // El avance es automático.
    $("next").hidden = true;

    if (finished) {
        completionDate = new Date();

        $("result").textContent =
            `Has resuelto correctamente los ${total} ejercicios ` +
            `del bloque «${blockTitle()}».`;

        $("studentName").focus();
        return;
    }

    $("answerForm").reset();

    $("feedback").textContent = "";
    $("feedback").className = "";

    $("hintText").hidden = true;
    $("check").disabled = false;
    $("hint").disabled = false;

    for (const id of [
        "coefficient",
        "exponent",
        "decimalAnswer"
    ]) {
        $(id).disabled = false;
    }

    $("position").textContent =
        `Ejercicio ${index + 1} de ${total}`;

    $("progress").max = total;
    $("progress").value = index;

    $("scientificFields").hidden = mode !== "science";
    $("decimalFields").hidden = mode !== "decimal";

    $("instruction").textContent =
        mode === "science"
            ? "Expresa en notación científica"
            : "Expresa en notación decimal";

    if (mode === "science") {
        $("number").textContent =
            display(scientific[index]);
    } else {
        const [coefficient, exponent] = decimals[index];

        $("number").innerHTML =
            `${display(coefficient)} × 10` +
            `<sup>${exponent}</sup>`;
    }
}

/* ------------------------------------------------------------
   CAMBIAR DE BLOQUE
------------------------------------------------------------ */

function changeMode(nextMode) {
    // Cancela cualquier avance pendiente.
    clearTimeout(advanceTimer);
    advanceTimer = null;

    mode = nextMode;
    index = 0;
    completionDate = null;

    $("diplomaCanvas").hidden = true;
    $("diplomaMessage").textContent = "";

    for (const id of ["science", "decimal"]) {
        $(id).classList.toggle("selected", id === mode);

        $(id).setAttribute(
            "aria-pressed",
            String(id === mode)
        );
    }

    render();
}

$("science").onclick = () => changeMode("science");
$("decimal").onclick = () => changeMode("decimal");

/* ------------------------------------------------------------
   COMPROBAR LA RESPUESTA
------------------------------------------------------------ */

$("answerForm").onsubmit = event => {
    event.preventDefault();

    if (
        $("check").disabled ||
        index >= items().length
    ) {
        return;
    }

    let correct = false;
    let message = "";

    if (mode === "science") {
        const coefficient = normalize(
            $("coefficient").value
        );

        const rawExponent = $("exponent").value
            .trim()
            .replace(/−/g, "-");

        const exponent = /^[+-]?\d+$/.test(rawExponent)
            ? Number(rawExponent)
            : NaN;

        const expected = scientificOf(
            scientific[index]
        );

        const coefficientValue = Number(
            $("coefficient").value.replace(",", ".")
        );

        if (
            !coefficient ||
            !Number.isSafeInteger(exponent)
        ) {
            message =
                "Escribe un coeficiente y un exponente entero. " +
                "Usa coma o punto decimal, sin separadores de miles.";
        } else if (
            !(coefficientValue >= 1 && coefficientValue < 10)
        ) {
            message =
                "El coeficiente debe ser mayor o igual que 1 " +
                "y menor que 10.";
        } else {
            const target = normalize(
                expected.coefficient
            );

            correct =
                coefficient.digits === target.digits &&
                coefficient.power === target.power &&
                exponent === expected.exponent;

            message =
                "Revisa cuántos lugares se mueve la coma " +
                "y el signo del exponente.";
        }
    } else {
        const answer = normalize(
            $("decimalAnswer").value
        );

        const [coefficient, exponent] = decimals[index];

        const target = normalize(
            expand(coefficient, exponent)
        );

        correct =
            Boolean(answer) &&
            answer.digits === target.digits &&
            answer.power === target.power;

        message = answer
            ? "Revisa la dirección de la coma y el número de ceros."
            : "Escribe un número decimal sin separadores de miles ni potencias.";
    }

    $("feedback").className =
        correct ? "good" : "bad";

    $("feedback").textContent =
        correct ? "¡Correcto!" : message;

    if (correct) {
        $("progress").value = index + 1;

        $("check").disabled = true;
        $("hint").disabled = true;
        $("next").hidden = true;

        for (const id of [
            "coefficient",
            "exponent",
            "decimalAnswer"
        ]) {
            $(id).disabled = true;
        }

        // Avanza automáticamente tras 0,8 segundos.
        advanceTimer = setTimeout(() => {
            advanceTimer = null;

            index++;
            render();

            if (index < items().length) {
                const inputId = mode === "science"
                    ? "coefficient"
                    : "decimalAnswer";

                $(inputId).focus();
            }
        }, 800);
    }
};

/* ------------------------------------------------------------
   MOSTRAR PISTAS
------------------------------------------------------------ */

$("hint").onclick = () => {
    if (
        $("hint").disabled ||
        index >= items().length
    ) {
        return;
    }

    $("hintText").hidden = false;

    if (mode === "science") {
        const { exponent } = scientificOf(
            scientific[index]
        );

        const direction = exponent >= 0
            ? "izquierda: el exponente será positivo"
            : "derecha: el exponente será negativo";

        $("hintText").textContent =
            "Coloca la coma después de la primera cifra " +
            "distinta de cero. Debe moverse " +
            `${Math.abs(exponent)} lugares hacia la ${direction}.`;
    } else {
        const [, exponent] = decimals[index];

        const direction =
            exponent >= 0 ? "derecha" : "izquierda";

        $("hintText").textContent =
            `Mueve la coma ${Math.abs(exponent)} lugares ` +
            `hacia la ${direction}. ` +
            "Añade ceros si no quedan cifras.";
    }
};

/* ------------------------------------------------------------
   REINICIAR
------------------------------------------------------------ */

$("restart").onclick = () => changeMode(mode);

/* ------------------------------------------------------------
   DIPLOMA DE FYQ
------------------------------------------------------------ */

function fittedText(
    ctx,
    text,
    x,
    y,
    size,
    maxWidth,
    color
) {
    ctx.fillStyle = color;

    do {
        ctx.font = `bold ${size}px Arial, sans-serif`;

        if (ctx.measureText(text).width <= maxWidth) {
            break;
        }

        size--;
    } while (size > 16);

    ctx.fillText(text, x, y);
}

function drawDiploma(name) {
    const canvas = $("diplomaCanvas");
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Fondo azul oscuro.
    const background = ctx.createLinearGradient(
        0,
        0,
        width,
        height
    );

    background.addColorStop(0, "#071d39");
    background.addColorStop(1, "#075767");

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    // Doble marco.
    ctx.strokeStyle = "#e6bd67";
    ctx.lineWidth = 5;

    ctx.strokeRect(
        38,
        38,
        width - 76,
        height - 76
    );

    ctx.strokeStyle = "#5392a1";
    ctx.lineWidth = 1;

    ctx.strokeRect(
        54,
        54,
        width - 108,
        height - 108
    );

    // Panel central.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(100, 235, 1400, 565);

    // Cabecera.
    ctx.textAlign = "center";

    ctx.fillStyle = "#e6bd67";
    ctx.font = "bold 64px Arial, sans-serif";
    ctx.fillText("FYQ", 800, 140);

    ctx.fillStyle = "#d8edf1";
    ctx.font = "24px Arial, sans-serif";

    ctx.fillText(
        "FÍSICA Y QUÍMICA",
        800,
        190
    );

    // Título.
    ctx.fillStyle = "#173651";
    ctx.font = "bold 52px Arial, sans-serif";

    ctx.fillText(
        "DIPLOMA DE PARTICIPACIÓN",
        800,
        320
    );

    ctx.fillStyle = "#087183";
    ctx.font = "bold 34px Arial, sans-serif";

    ctx.fillText(
        "NOTACIÓN CIENTÍFICA",
        800,
        375
    );

    ctx.fillStyle = "#536579";
    ctx.font = "26px Arial, sans-serif";
    ctx.fillText("Se concede a", 800, 450);

    // Nombre del alumno.
    fittedText(
        ctx,
        name,
        800,
        535,
        58,
        1240,
        "#173651"
    );

    ctx.strokeStyle = "#e6bd67";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(350, 565);
    ctx.lineTo(1250, 565);
    ctx.stroke();

    ctx.fillStyle = "#536579";
    ctx.font = "26px Arial, sans-serif";

    ctx.fillText(
        "por completar correctamente todos los ejercicios del bloque",
        800,
        625
    );

    fittedText(
        ctx,
        blockTitle(),
        800,
        680,
        34,
        1240,
        "#087183"
    );

    ctx.fillStyle = "#173651";
    ctx.font = "bold 25px Arial, sans-serif";

    ctx.fillText(
        `${items().length} ejercicios completados`,
        800,
        745
    );

    // Fecha.
    const date = completionDate.toLocaleDateString(
        "es-ES",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Atlantic/Canary"
        }
    );

    ctx.fillStyle = "#d8edf1";
    ctx.font = "25px Arial, sans-serif";
    ctx.fillText(date, 800, 870);

    // Autoría.
    ctx.fillStyle = "#e6bd67";
    ctx.font = "bold 30px Arial, sans-serif";

    ctx.fillText(
        "Samuel López Melián",
        800,
        945
    );

    ctx.fillStyle = "#d8edf1";
    ctx.font = "22px Arial, sans-serif";

    ctx.fillText(
        "Profesor de Física y Química",
        800,
        985
    );

    canvas.hidden = false;

    return canvas;
}

/* ------------------------------------------------------------
   DESCARGAR EL DIPLOMA COMO PNG
------------------------------------------------------------ */

$("diplomaForm").onsubmit = event => {
    event.preventDefault();

    if (
        index !== items().length ||
        !completionDate
    ) {
        return;
    }

    const nameInput = $("studentName");

    const name = nameInput.value
        .trim()
        .replace(/\s+/g, " ");

    nameInput.setCustomValidity("");

    if (name.split(" ").length < 2) {
        nameInput.setCustomValidity(
            "Escribe tu nombre y apellidos."
        );

        nameInput.reportValidity();
        return;
    }

    const canvas = drawDiploma(name);

    const safeName = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    const link = document.createElement("a");

    link.download =
        `Diploma_FYQ_${mode}_${safeName}.png`;

    link.href = canvas.toDataURL("image/png");

    document.body.appendChild(link);
    link.click();
    link.remove();

    $("diplomaMessage").textContent =
        "Diploma generado. Entrega el archivo PNG descargado. " +
        "También puedes mantener pulsada la imagen para guardarla en el móvil.";
};

$("studentName").oninput = () => {
    $("studentName").setCustomValidity("");
};

/* ------------------------------------------------------------
   INICIAR LA ACTIVIDAD
------------------------------------------------------------ */

render();