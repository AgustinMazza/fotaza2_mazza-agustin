import 'dotenv/config'
import express from 'express'


const app = express()

//constantes
const PORT = process.env.PORT

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//motor de plantillas
app.set('view engine', 'pug')
app.set('views', './views')

//servidor
app.listen(PORT, () =>{
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})

//rutas
app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/fotos',(req,res)=>{
    res.render('fotos')
})