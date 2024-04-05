const express = require("express");
const axios = require("axios");
const path = require("path");

const url = 'http://localhost:8080';
const app = express();

// Configuraciones
app.set("view engine", "ejs");

// Configurar la ruta estática para los archivos en la carpeta 'public'
app.use(express.static(path.join(__dirname, "public")));

// Ruta para obtener todas las empresas y renderizarlas en index.ejs
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${url}/empresa`);
    const empresas = response.data.empresas;
    res.render("index", { empresas });
  } catch (error) {
    console.error("Error al obtener las empresas:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Ruta para obtener los detalles de una empresa específica
app.get("/empresa/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const responseEmpresa = await axios.get(`${url}/empresa/${id}`);
    const empresa = responseEmpresa.data.empresa;

    // Obtener las noticias asociadas a la empresa
    const responseNoticias = await axios.get(`${url}/noticia`);
    let noticias = responseNoticias.data.noticias.filter((n) => n.empresa.id == id);

    // Ordenar las noticias por fecha de publicación (de más reciente a más antigua)
    noticias.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));

    // Tomar solo las 3 noticias más recientes
    noticias = noticias.slice(0, 3);

    res.render("home", { empresa, noticias });
  } catch (error) {
    console.error("Error al obtener los detalles de la empresa:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Ruta para obtener los detalles de una noticia específica
app.get("/noticia/:id", async (req, res) => {
  try {
    const idNoticia = req.params.id;
    // Obtener los detalles de la noticia utilizando su ID
    const responseNoticia = await axios.get(`${url}/noticia/${idNoticia}`);
    const noticia = responseNoticia.data.noticia;

    // Puedes obtener más datos de la empresa si es necesario
    const responseEmpresa = await axios.get(`${url}/empresa/${noticia.empresa.id}`);
    const empresa = responseEmpresa.data.empresa;

    // Renderizar la página de detalle de la noticia con los datos obtenidos
    res.render("detalle", { noticia, empresa });
  } catch (error) {
    console.error("Error al obtener los detalles de la noticia:", error);
    res.status(500).send("Error interno del servidor");
  }
});



app.get("/buscar", async (req, res) => {
  try {
    const keyword = req.query.buscar;
    const empresaId = req.query.empresaId; // Obtener el ID de la empresa de la consulta

    // Obtener todas las noticias
    const responseNoticias = await axios.get(`${url}/noticia`);
    let noticias = responseNoticias.data.noticias;

    // Filtrar las noticias que contienen la palabra clave en el título o el resumen
    noticias = noticias.filter(n => 
      n.tituloNoticia.toLowerCase().includes(keyword.toLowerCase()) ||
      n.resumenNoticia.toLowerCase().includes(keyword.toLowerCase())
    );

    // Si hay un ID de empresa especificado, filtrar las noticias por esa empresa
    if (empresaId) {
      noticias = noticias.filter(n => n.empresa.id === parseInt(empresaId)); // Convertir empresaId a entero para asegurar la comparación
    }

    // Ordenar las noticias por fecha de publicación (de más reciente a más antigua)
    noticias.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));

    // Limitar el número de noticias a 20 como máximo
    noticias = noticias.slice(0, 20);

    // Obtener la información de la empresa si se proporciona un ID de empresa
    let empresa = null;
    if (empresaId) {
      const responseEmpresa = await axios.get(`${url}/empresa/${empresaId}`);
      empresa = responseEmpresa.data.empresa;
    }

    // Renderizar la página de resultados de búsqueda con las noticias filtradas y la información de la empresa
    res.render("buscador", { noticias, keyword, empresa });
  } catch (error) {
    console.error("Error al realizar la búsqueda:", error);
    res.status(500).send("Error interno del servidor");
  }
});


// Inicia el servidor en el puerto 3000
app.listen(3000, function () {
  console.log("El servidor es http://localhost:3000");
});
