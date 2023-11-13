import express from 'express'
import aseo_smc from './aseo_smc.js';
import {query,validationResult} from 'express-validator'

const app = express();

app.use(express.json());
app.disable("x-powered-by");
process.setMaxListeners(80)

// Route
app.get("/extractor",query("id").notEmpty(),query("municipality").notEmpty(),
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const data = req.query.id;
      const rol = data.substring(0,data.indexOf('-'))
      const dv= data.substring(data.indexOf('-')+1,data.length)
      const municipality= req.query.municipality.toLowerCase().replace('í','i').replace('ú','u').replace(' ','_').replace('-','_')
      if (rol == "" || dv ==""){
        return res.status(400).send({ id: "Error en rol" })
      }
      const total = await aseo_smc(municipality,rol, dv);
      const {invoice_amount }= total.data
      if (invoice_amount == "Error al cargar página"){
        res.status(500).json(total)
      }else {
        res.status(200).json(total);
      }
    } else {
      return res.status(400).send({ id: "Falta rol o municipalidad" });
    }
  }
);

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server hosted on ${PORT}`);
});
