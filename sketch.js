//Inicialización selects
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems);
});

/*
 *============ INSTANCIACIÓN ELEMENTOS DEL DOOM =============
 */



//Datos Selects
//Tonalidad
function cambiarTonalidad() {
  var seleccionT = document.getElementById('tonalidad').options.selectedIndex;
  //console.log(seleccionT);
  return seleccionT;
}


//Escala
function cambiarEscala() {
  var seleccionE = document.getElementById('escala').options.selectedIndex;
  //console.log(seleccionE);
  return seleccionE;
}

//========================================

let posicionesLx;
let posicionesLy;
let scoreMiz;


let posicionesRx;
let posicionesRy;
let scoreMdr;

let limitIzq = 420;
let limitDer = 10;

let fuentesNotas = []; //Array png notas


let canvas2;
let canvas3;
let posLx;
let posLy;

let Escala = [];
let FuentesEscala = [];

let arrayFescalas = [];
let modFescalas = [];


let playing = false;
let osc = new p5.Oscillator('sine');

//==========SKETCH 1 ================
var sketch1 = function (p) {
  let video;
  let poseNet;
  let pose;

  //Carga de las fuentes en el Array
  function cargaImagenes() {
    for (var i = 0; i < 13; i++) {
      fuentesNotas[i] = p.loadImage("fuentes/" + i + ".png");
    }
  }

  p.setup = function () {
    var canvas = p.createCanvas(640, 480);
    canvas.parent('sketch1');
    video = p.createCapture(p.VIDEO);
    video.hide();
    cargaImagenes();


    poseNet = ml5.poseNet(video, modeloCargado);

    poseNet.on('pose', gotPoses);
  };

  function gotPoses(poses) {
    //console.log(poses);
    if (poses.length > 0) {
      if (poses[0].pose.keypoints[9].score > 0.2) {
        let maizx = poses[0].pose.keypoints[9].position.x;
        let maizy = poses[0].pose.keypoints[9].position.y;

        posicionesLx = maizx;
        posicionesLy = maizy;

      } else {
        posicionesLx = null;
        posicionesLy = null;
      }

      if (poses[0].pose.keypoints[10].score > 0.2) {
        let munDrX = poses[0].pose.keypoints[10].position.x;
        let munDrY = poses[0].pose.keypoints[10].position.y;

        posicionesRx = munDrX;
        posicionesRy = munDrY;
      } else {
        posicionesRx = null;
        posicionesRy = null;
      }
    }
  }

  function modeloCargado() {
    console.log('Modelo Listo...');
    document.getElementById("mensajeCarga").textContent = "Modelo Listo";
    document.getElementById("colorMensaje").className = "card-panel deep-orange lighten-1 center-align";
  }

  p.draw = function () {
    p.translate(video.width, 0);
    p.scale(-1, 1);
    p.image(video, 0, 0, video.width, video.height);

    if (posicionesLx != null && posicionesLy != null) {
      p.fill(255, 0, 0);
      p.ellipse(posicionesLx, posicionesLy, 30);
    }
    if (posicionesRx != null && posicionesRy != null) {
      p.fill(255, 0, 0);
      p.ellipse(posicionesRx, posicionesRy, 30);

    }
  };
};

//========================================================

let sw = 1;
let glow = 1;

//dos Alturas
var sketch2 = function (p) {
  p.setup = function () {
    canvas2 = p.createCanvas(440, 480);
    canvas2.parent('sketch2');
  };


  p.draw = function () {
    p.translate(canvas2.width, 0); //Rotar el canvas
    p.scale(-1, 1);
    p.background(29, 53, 87);


    //División canvas
    let w = p.width / 8;

    for (let i = 0; i < 10; i++) {
      if (posicionesRx > w * i && posicionesRx < (w * i) + w ) {
        p.fill('#fae');
      } else {
        p.fill(29, 53, 87);
      }
      p.stroke(255, 69, 0);
      p.strokeWeight(1);
      p.rect(w * i, 0, w, p.height);
    }

    let n = p.floor(p.map(posicionesRx, 0, 440, 0, 8, true));


    let amplitud = parseFloat(p.map(posLy, 0, 280, 1, 0));

    //Control Amplitud
    if (isFinite(amplitud)) {
      osc.amp(amplitud, 0.3);
    }

    //Escalas
    switch (cambiarEscala()) {
      case 1:
        Escala = [12, 11, 9, 7, 5, 4, 2, 0]; //Mayor
        FuentesEscala = [0, 11, 9, 7, 5, 4, 2, 0];
        break;
      case 2:
        Escala = [12, 11, 8, 7, 5, 3, 2, 0]; //Menor 
        FuentesEscala = [0, 11, 8, 7, 5, 3, 2, 0];
        break;
      case 3:
        Escala = [16, 14, 12, 9, 7, 4, 2, 0]; //Pentatónica 
        FuentesEscala = [4, 2, 0, 9, 7, 4, 2, 0];
        break;
      case 4:
        Escala = [15, 14, 12, 8, 7, 3, 2, 0] //Akebono
        FuentesEscala = [3, 2, 12, 8, 7, 3, 2, 0];
          break;  
      default:
        Escala = [12, 11, 9, 7, 5, 4, 2, 0]; //Mayor
        FuentesEscala = [0, 11, 9, 7, 5, 4, 2, 0];
        break;
    }



    //Posicionado Fuentes Notas
    let pos = 4;
    switch (cambiarTonalidad()) {
      case 1: //C
        for (let i = 0; i < 8; i++) {
          p.image(fuentesNotas[FuentesEscala[i]], pos, 240);
          osc.freq(p.midiToFreq(Escala[n] + 48));
          pos += 56;
        }
        break;
      case 2: //F
        arrayFescalas = [];
        modFescalas = [];

        arrayFescalas = FuentesEscala.map(function (item) {return item + 5});
        modFescalas = arrayFescalas.map(function(item){return item % 12});

        for (let i = 0; i < 8; i++) {
          p.image(fuentesNotas[modFescalas[i]], pos, 240);
          osc.freq(p.midiToFreq(Escala[n] + 53));
          pos += 56;
        }
        break;
      case 3: //G
        arrayFescalas = [];
        modFescalas = [];

        arrayFescalas = FuentesEscala.map(function (item) {return item + 7});
        modFescalas = arrayFescalas.map(function(item){return item % 12});

        for (let i = 0; i < 8; i++) {
          p.image(fuentesNotas[modFescalas[i]], pos, 240);
          osc.freq(p.midiToFreq(Escala[n] + 55));
          pos += 56;
        }
        break;
        case 4: //A
        arrayFescalas = [];
        modFescalas = [];

        arrayFescalas = FuentesEscala.map(function (item) {return item + 9});
        modFescalas = arrayFescalas.map(function(item){return item % 12});

        for (let i = 0; i < 8; i++) {
          p.image(fuentesNotas[modFescalas[i]], pos, 240);
          osc.freq(p.midiToFreq(Escala[n] + 57));
          pos += 56;
        }
        break;
      default: //C
        for (let i = 0; i < 8; i++) {
          p.image(fuentesNotas[FuentesEscala[i]], pos, 240);
          osc.freq(p.midiToFreq(Escala[n] + 60));
          pos += 56;
        }
        break;
    }


    //ellipse selección animación
    if (sw > 20 || sw < 1) {
      glow = -glow;
    }

    sw += glow;
    if (posicionesRx != null && posicionesRy != null) {
      p.stroke(255, 50);
      p.strokeWeight(sw);
      p.fill(240);
      p.ellipse(posicionesRx, posicionesRy, 32);
    }
  };
};
//==========================================================


//tres Amplitud
var sketch3 = function (p) {
  p.setup = function () {
    canvas3 = p.createCanvas(240, 280);
    canvas3.parent('sketch3');
  };

  p.draw = function () {
    p.translate(canvas3.width, 0);
    p.scale(-1, 1);
    p.background(29, 53, 87);
    let w = p.width / 8;

    if (sw > 20 || sw < 1) {
      glow = -glow;
    }

    sw += glow;
    if (posicionesLx != null && posicionesLy != null) {
      p.stroke(255, 50);
      p.strokeWeight(sw);
      p.fill(240);
      posLx = p.map(posicionesLx, 0, 640, 0, 240);
      posLy = p.map(posicionesLy, 0, 480, 0, 280);

      p.ellipse(posLx, posLy, 32);
      if (playing == false) {
        encendido();
      }
    } else {
      if (playing) {
        apagado();
      }
    }
  };
};
//================================================

var primerSketch = new p5(sketch1);
var segundoSketch = new p5(sketch2);
var tercerskecth = new p5(sketch3);

//Funciones Encedido audio
function encendido() {
  osc.amp(0.1);
  osc.start();
  playing = true;
}

//Funcion apagado audio
function apagado() {
  osc.amp(0, 0.5);
  osc.stop();
  playing = false;
}