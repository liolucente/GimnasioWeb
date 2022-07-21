const express = require('express');
const app = express();
require('dotenv').config();
const Port = process.env.PORT || 8080;
const hbs = require('hbs');
const mysql = require('mysql2');
const path = require('path');
const nodemailer = require('nodemailer');

//Conectamos la app a una Base de Datos
const conexion = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    port: process.env.PORTDB,
    database: process.env.DATABASE,
});

//Conectamos la DB
const conectar = (conexion.connect((error) => {
        if (error) throw error;
        console.log('Base de Datos Conectada!!');
    })
);

// Configuración de Middelwares
app.use(express.json());
//app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: false}));
//Configuramos la Vista de la Aplicación
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));

app.get('/', (req, res) =>{
    res.render('index', {titulo: 'INSTITUCIÓN CULTURAL Y DEPORTIVA PEDRO ECHAGÜE'})
});

app.get('/asistencias', (req, res) =>{
    let sql = "SELECT disciplina, profe_nombre,fecha,asist_horaDesde,afiliado FROM datos_asistencias where asist_fecha = current_date order by disciplina, asist_fecha,asist_horaDesde,pers_apellido,pers_nombre";
    let query = conexion.query(sql, (err, results) =>{
        if (err) throw err;
        res.render('asistencias', {
            results
        })
    }); 
});

app.get('/altaprofesores', (req, res) =>{
    res.render('altaprofesores', {titulo: 'Alta de profesores'})
});

app.get('/profesores', (req, res) =>{
        let sql = "SELECT * FROM PROFESORES order by profe_apellido,profe_nombre";
        let query = conexion.query(sql, (err, results) =>{
            if (err) throw err;
            res.render('profesores', {
                titulo: 'Listado de profesores',
                results
            })
        });   
    });

app.get('/modiafiliados', (req, res) =>{
    let sql = "SELECT * FROM personas order by pers_idreg";
    let query = conexion.query(sql, (err, results) =>{
        if (err) throw err;
        res.render('modiafiliados', {
            titulo: 'Listado de afiliados',
            results
        })
    }); 
}); 

app.post('/altaprofesores', (req, res) =>{
    const { nombre, apellido, dni, email } = req.body;
    if(nombre == "" || apellido == "" || dni == ""){
        let validacion = 'Es obligatorio informar nombre, apellido y dni del profesor.'
        res.render('altaprofesores', {
            titulo: 'Alta de profesores',
            validacion
        })
    }else{    
        let data = {
            profe_nombre: nombre,
            profe_apellido: apellido,
            profe_dni: dni,
            profe_email: email
        }
        let sql = "INSERT INTO PROFESORES SET ?"; 
        let query = conexion.query(sql, data, (err, results) =>{
            if (err) throw err;
            res.render('altaprofesores', {titulo: 'Alta de profesores'})
        });  
    }
});

app.get('/afiliados', (req, res) =>{
    res.render('afiliados', {titulo: 'Alta de Afiliados'})
});

//DAMOS DE ALTA LOS DATOS DE AFILIADOS SI PASAN LAS VALIDACIONES
app.post('/afiliados', (req, res) =>{
    const { nombre, apellido, dni, email } = req.body;
    if(nombre == "" || apellido == "" || dni == ""){
        let validacion = 'Es obligatorio informar nombre, apellido y dni del afiliado.'
        res.render('afiliados', {
            titulo: 'Alta de afiliados',
            validacion
        })
    }else{    
        let data = {
            profe_nombre: nombre,
            profe_apellido: apellido,
            profe_dni: dni,
            profe_email: email
        }
        let sql = "INSERT INTO PERSONAS SET ?"; 
        let query = conexion.query(sql, data, (err, results) =>{
            if (err) throw err;
            res.render('afiliados', {titulo: 'Alta de afiliados'})
        });
    }
});

app.get('/disciplinas', (req, res) =>{
    res.render('disciplinas', {titulo: 'Alta de Disciplinas'})
});

app.get('/modidisciplinas', (req, res) =>{
    let sql = "SELECT * FROM disciplinas order by inte_item";
    let query = conexion.query(sql, (err, results) =>{
        if (err) throw err;
        res.render('modidisciplinas', {
            titulo: 'Listado de disciplinas',
            results
        })
    });
}); 

app.post('/disciplinas', (req, res) =>{
    const { item, texto } = req.body;
    if(item == "" || texto == ""){
        let validacion = 'El nro de ítem debe ser mayor que cero y el texto no puede quedar vacío.'
        res.render('disciplinas', {
            titulo: 'Alta de Disciplinas',
            validacion
        })
    }else{    
        let data = {
            inte_codigo: "2",
            inte_item: item,
            inte_Texto: texto,
            inte_referencia: 'Referencias Disciplinas'
        }
        let sql = "INSERT INTO refer_internas SET ?"; 
        let query = conexion.query(sql, data, (err, results) =>{
            if (err) throw err;
            res.render('disciplinas', {titulo: 'Alta de Disciplinas'})
        }); 
    }
});

//ACTUALIZAMOS LAS DISCIPLINAS
app.post('/disciplinaUpdate',(req,res) => {
    let sql = "update refer_internas set inte_codigo = 2, inte_item = " + req.body.inte_item + 
    ", inte_texto = '" + req.body.inte_texto +
    "', inte_referencia = 'Referencia Disciplinas' WHERE inte_idreg = " + req.body.inte_idreg
    let query = conexion.query(sql, (err, results) =>{
        if (err) throw err;
    });
    res.redirect('modidisciplinas');
}) ;

//ELIMINAMOS LAS DISCIPLINAS
app.post('/disciplinaDelete',(req,res) => {
    let sql ="delete from refer_internas where inte_idreg = " + req.body.inte_idreg; 
    let query = conexion.query(sql, (err, results) =>{
        if (err) throw err;
    });
    res.redirect('modidisciplinas')
}) 

//ACTUALIZAMOS LOS DATOS DE LA TABLA DE PROFESORES
app.post('/profesoresUpdate',(req,res) => {
    let sql = "update profesores set profe_nombre = '" + req.body.profe_nombre + 
    "', profe_apellido='" + req.body.profe_apellido + 
    "', profe_dni = " + req.body.profe_dni +
    ", profe_email = '" + req.body.profe_email +
    "' WHERE profe_idreg = " + req.body.profe_idreg
    let query = conexion.query(sql, (err, results) =>{
        if (err) throw err;
    });
    res.redirect('profesores');
}) ;

//ELIMINAMOS LOS DATOS DE LA TABLA DE PROFESORES
app.post('/profesoresDelete',(req,res) => {
    let sql ="delete from profesores where profe_idreg = " + req.body.profe_idreg; 
    let query = conexion.query(sql, (err, results) =>{
        if (err) throw err;
    });
    res.redirect('profesores')
}) 

//ACTUALIZAMOS LOS DATOS DE LA TABLA DE PERSONAS
app.post('/personasUpdate',(req,res) => {
    let sql = "update personas set pers_nombre = '" + req.body.pers_nombre + 
    "', pers_apellido='" + req.body.pers_apellido + 
    "', pers_dni = " + req.body.pers_dni +
    ", pers_email = '" + req.body.pers_email +
    "' WHERE pers_idreg = " + req.body.pers_idreg
    let query = conexion.query(sql, (err, results) =>{
        if (err) throw err;
    });
    res.redirect('modiafiliados');
}) ;

//ELIMINAMOS LOS DATOS DE LA TABLA DE PERSONAS
app.post('/personasDelete',(req,res) => {
    let sql ="delete from personas where pers_idreg = " + req.body.pers_idreg; 
    let query = conexion.query(sql, (err, results) =>{
        if (err) throw err;
    }); 
    res.redirect('modiafiliados')
}) 


app.get('/registroabonos', (req, res) =>{
    let sql = "SELECT * FROM disciplinas order by inte_texto";
    let query = conexion.query(sql, (err, results) =>{
        if (err) throw err;
        res.render('registroabonos', {
            titulo: 'Registro de abonos mensuales',
            results
        })
    });     
});


app.post('/registroabonos', (req, res) =>{
    const { dni, pers_idreg, disciplina, importe, fecha } = req.body;
    if(importe <= "0" || dni <= 0){
        let validacion = 'El importe debe ser mayor que cero';
        res.render('registroabonos', {titulo: 'Registro de abonos mensuales',validacion})
    }else{

        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }
        
        var date = new Date();

        let data = {
            abono_dniPersona: dni,
            abono_itemDisciplina: disciplina,
            abono_importe: importe,
            abono_periododesde: fecha,
            abono_periodohasta: date.addDays(30)
        }
        let sql = "INSERT INTO abonos SET ?"; 
        let query = conexion.query(sql, data, (err, results) =>{
            if (err) throw err;
        });

        let sql2 = "SELECT * FROM disciplinas order by inte_texto";
        let query2 = conexion.query(sql2, (err, results) =>{
            if (err) throw err;
            res.render('registroabonos', {
                titulo: 'Registro de abonos mensuales',
                results
            })
        });     
    } 
});

app.get('/vencimientoabonos', (req, res) =>{
    let sql = "SELECT * FROM vencimientos_abonos where abono_periodohasta = current_date order by disciplina, afiliado";
    let query = conexion.query(sql, (err, results) =>{
        if (err) throw err;
        res.render('vencimientoabonos', {
            titulo: 'Vencimientos de abonos para el día de hoy',
            results
        })
    });       
})

app.get('/ubicacion', (req, res) =>{
    res.render('ubicacion', {titulo: 'Nuestro centro deportivo queda ubicado en Portela 836 - Flores - CABA'})
})

app.get('/contacto', (req, res) =>{
    res.render('contacto', {titulo: 'Escríbenos'})
});
app.listen(Port, ()=>{
    console.log(`Servidor corriendo en el Puerto ${Port}`);
});
app.on('error', (error) =>{
    console.log(`Tenemos un error ${error}`);
});
