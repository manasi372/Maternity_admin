var express = require("express");
var exe = require("./../connection");
var router = express.Router();

 


router.get("/", async function(req,res){
var slider = await exe("SELECT * FROM slider");
var about = await exe("SELECT * FROM about"); 
const cards = await exe("SELECT * FROM card");
var doctor_info = await exe("SELECT * FROM doctor_info");  
var countdown = await exe("SELECT * FROM countdown");
var youtube = await exe("SELECT * FROM youtube");
var obj ={"slider":slider,"about":about,"cards":cards,"doctor_info":doctor_info,"countdown":countdown, "youtube":youtube}
res.render("user/home.ejs",obj);
});


router.post("/save_appointment",async function(req,res){
    var d = req.body;

    var sql = `INSERT INTO appointment (name,email,mobile,subject,message)VALUES(?,?,?,?,?)`;
    var data = await exe(sql,[d.name,d.email,d.mobile,d.subject,d.message])
    res.redirect("/")
})

// aboutpage
router.get("/aboutpage", async function (req, res) {
    const sliders = await exe("SELECT * FROM aboutus");
    const about = await exe("SELECT * FROM aboutinfo");
    var specialist = await exe("SELECT * FROM  specialists;"); 
    var commitment = await exe("SELECT * FROM commitment;"); 
    var reviews = await exe("SELECT * FROM review"); 
  
    res.render("user/aboutpage.ejs", { aboutus: sliders,"about":about,"specialist":specialist,"commitment":commitment,"reviews":reviews });
});
router.get("/appointment",  async function(req,res){
    var services = await exe("SELECT * FROM service"); 
    var facilities = await exe("SELECT * FROM facility");  
    res.render("user/appointment.ejs",);
});

router.get("/servicepage",  async function(req,res){
    var services = await exe("SELECT * FROM service"); 
    var facilities = await exe("SELECT * FROM facility");  
    res.render("user/servicepage.ejs",{"services":services,"facilities":facilities});
});

router.get("/gallery",  async function(req,res){
    var gallery = await exe("SELECT * FROM gallery");
    var gallery_image = await exe(`SELECT * FROM gallery_image`)
 
    res.render("user/gallery.ejs",{"gallery":gallery,"gallery_image":gallery_image});

});

router.get("/insurence", async function(req,res){
    var insurenceslider = await exe(`SELECT * FROM insurenceslider`);
    var insuranceplans = await exe(`SELECT * FROM insurenceplan `)
    res.render("user/insurence.ejs",{"insurenceslider":insurenceslider,"insuranceplans":insuranceplans});
});

router.get("/blog", async function(req,res){
    var blogslider = await exe(`SELECT * FROM blogslider`);
    var blogs = await exe(`SELECT * FROM blogs `)
    res.render("user/blog.ejs",{"blogslider":blogslider, "blogs":blogs});
});

router.get("/contactus", async function(req,res){
    var contactslider = await exe(`SELECT * FROM contactslider`);
    var contactsource = await exe(`SELECT * FROM contactsource `)
    res.render("user/contact.ejs",{"contactslider":contactslider, "contactsource":contactsource})
});

router.post("/save_form",async function (req, res) {
    const { name, email, mobile, subject, message } = req.body;
    const sql = `INSERT INTO submit (name, email, mobile, subject, message) VALUES (?, ?, ?, ?, ?)`;

    await exe(sql, [name, email, mobile, subject, message], (err, result) => { // ✅ Corrected `exe` to `db.query`
        if (err) {
            console.error("Error inserting data: " + err);
            return res.status(500).send("Database error: " + err.message);
        }
        res.redirect("/contactus");
    });
});


router.get("/plan", function(req,res){
    res.render("user/plan.ejs");
});

 

module.exports = router;