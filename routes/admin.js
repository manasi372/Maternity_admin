var express = require("express");
var exe = require("./../connection");
var router = express.Router();
var mysql = require("mysql");
var nodemailer = require("nodemailer");
var bodyParser = require("body-parser");
var session = require("express-session");
   





router.get("/",function(req,res){
    res.render("admin/login.ejs");
});

router.get("/login",function(req,res){
    res.render("login.ejs");
});
router.post("/save_data",async function(req,res)
{
    var d = req.body;
    var sql = `SELECT * FROM  login WHERE  email = '${d.email}' AND password = '${d.password}'`;
    var data = await exe(sql);
    if(data.length > 0)
    {
        res.redirect("/admin/index");
    }
    else{
         res.redirect("/admin/");
    }
});

router.post("/profile/update", async function(req,res)
{
    var d = req.body;   
    var sql1 = `INSERT INTO user_profiles(username, logo_img) 
    VALUES ('${d.username}','${d.logo_img}')`;
    var data1 = await exe(sql1);
    // res.redirect("/admin/index");
    // res.send(data1);
    
});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
}));

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mhasakehospital"
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "bharatij219@gmail.com",
        pass: "bfxd lkgi uoog iuvy",
    }
});

 
// Forgot Password Page
router.get("/admin/forgot", (req, res) => {
    res.render("forgot.ejs");
});

// Generate OTP
router.get("/generate-otp", (req, res) => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    req.session.otp = otp;
    res.json({ otp: otp });
});

router.post('/send-otp', (req, res) => {
    const hospital_email = req.body.hospital_email;
    
    // Check if the email exists in the hospital table
    db.query('SELECT * FROM hospital WHERE hospital_email = ?', [hospital_email], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send('Database error');
      }
  
      if (results.length > 0) {
        const otp = Math.floor(1000 + Math.random() * 9000); // Generate OTP
        req.session.otp = otp;
        req.session.email = hospital_email;
  
        // ✅ **Correct way to define mailOptions**
        const mailOptions = {
          from: 'your-email@gmail.com',  // ✅ Replace with your email
          to: hospital_email,
          subject: 'Password Reset OTP',
          text: `Your OTP for password reset is: ${otp}`
        };
  
        // ✅ **Send Email using Nodemailer**
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);  // Debugging error
            return res.status(500).send('Error sending email');
          } else {
            console.log("Email sent:", info.response);
            res.send('<form action="/verify-otp" method="POST"><input type="text" name="otp" required><input type="submit" value="Verify OTP"></form>');
          }
        });
        
      } else {
        res.status(404).send('Email not found');
      }
    });
  });
  
  

 
router.get("/index",function(req,res){
    res.render("admin/index.ejs");
});
router.get("/forgot",function(req,res){
    res.render("admin/forgot.ejs");
});
router.get("/profile",function(req,res){
    res.render("admin/profile.ejs");
});
router.get("/pagessignup",function(req,res){
    res.render("admin/pagessignup.ejs");
});

 

 router.get("/slider", async function(req, res) {
    var slider = await exe("SELECT * FROM slider"); 
    console.log("Request received");
    res.render("admin/slider.ejs", { slider });
});

  
router.post("/save_slider", async function(req, res) {
    var img1 = "";
    
    if (req.files) {
        if (req.files.img1) {
            img1 = new Date().getTime() + req.files.img1.name;
            req.files.img1.mv("public/admin_assets/" + img1);
        }
    }

    var d = req.body;
    var sql = `INSERT INTO slider (text1, text2, img1) VALUES (?,?,?)`;
    await exe(sql, [d.text1, d.text2, img1]);

    res.redirect("/admin/slider");
});

 router.get("/slider_list", async function(req, res) {
    var slider = await exe("SELECT * FROM slider");
    var obj = {slider:slider};
    res.render("admin/slider.ejs",obj);
});

router.get("/edit_slider/:id",async function (req,res){
    var id = req.params.id;
    var data = await exe(`SELECT * FROM slider WHERE slider_id = ${id}`);
    var obj = {"slider":data[0]};
    res.render("admin/edit_slider.ejs",obj);
});

router.post("/update_slider", async function(req,res){
    try
    {
     var d = req.body;
     d.text1 = d.text1.replaceAll("'","\\'");
     d.text2 = d.text2.replaceAll("'","\\'");
     d.text3 = d.text3.replaceAll("'","\\'");
     d.text4 = d.text4.replaceAll("'","\\'");

     d.img1 = d.img1.replaceAll("'","\\'");
     d.img2 = d.img2.replaceAll("'","\\'");
     d.img3 = d.img3.replaceAll("'","\\'");
     d.img4 = d.img4.replaceAll("'","\\'");

     var id = req.body.slider_id;
 
    var sql = `UPDATE slider SET
               text1 = '${d.text1}',
               text2 = '${d.text2}',
               text3 = '${d.text3}',
               text4 = '${d.text4}',

               img1 = '${d.img1}',
               img2 = '${d.img2}',
               img3 = '${d.img3}',
               img4 = '${d.img4}'

                 WHERE slider_id = '${id}'`;
                var data = await exe(sql);
                res.redirect("/admin/slider_list");

            }catch(err){
                res.send("Invalid Data");
            }
        
});

 

router.get("/delete_slider/:id",  async function(req,res){
    var id = req.params.id;
    var sql = `DELETE FROM slider WHERE slider_id = '${id}'`;
    var data = await exe(sql);
    res.redirect("/admin/slider_list");
});

router.get("/about", async function(req,res)
{
    var about = await exe("SELECT * FROM about"); 
    res.render("admin/about.ejs", { about });
});

router.post("/save_about", async (req, res) => 
    {
        var img = "";
    
        if (req.files) {
            if (req.files.img) {
                img = new Date().getTime() + req.files.img.name;
                req.files.img.mv("public/admin_assets/" + img);
            }
            
            
        }
    var d = req.body;
    var sql = `INSERT INTO about (img, heading, info, tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await exe(sql, [img, d.heading, d.info, d.tag1, d.tag2, d.tag3, d.tag4, d.tag5, d.tag6, d.tag7, d.tag8]);
    res.redirect("/admin/about");
});

router.get("/about_list", async function(req, res) {
var about = await exe("SELECT * FROM about");
var obj = { about: about };
res.render("admin/about.ejs", obj);
});


router.get("/edit_about/:id", async (req, res) => {
    let id = req.params.id;
    let about = await exe("SELECT * FROM about WHERE id = ?", [id]);

    if (about.length > 0) {
        res.render("admin/edit_about.ejs", { about: about[0] });
    } else {
        res.redirect("/admin/about");
    }
});


router.post("/update_about/:id", async (req, res) => {
    let id = req.params.id;
    let d = req.body;
    let img = d.old_img; // Keep the existing image if no new one is uploaded

    if (req.files && req.files.img) {
        img = new Date().getTime() + req.files.img.name;
        req.files.img.mv("public/admin_assets/" + img);
    }

    let sql = `UPDATE about SET img=?, heading=?, info=?, tag1=?, tag2=?, tag3=?, tag4=?, tag5=?, tag6=?, tag7=?, tag8=? WHERE id=?`;
    await exe(sql, [img, d.heading, d.info, d.tag1, d.tag2, d.tag3, d.tag4, d.tag5, d.tag6, d.tag7, d.tag8, id]);

    res.redirect("/admin/about");
});

 

router.get("/delete_about/:id",  async function(req,res){
    var id = req.params.id;
    var sql = `DELETE FROM about WHERE id = '${id}'`;
    var data = await exe(sql);
    res.redirect("/admin/about_list");
});


// doctorsection

router.get("/doctor", async function(req,res){
    var doctor_info = await exe(`SELECT * FROM doctor_info `)
    res.render("admin/doctor.ejs",{doctor_info});
});

router.post("/save_doctor", async function(req, res) {
    let photo = "";
    if (req.files && req.files.photo) {
        photo = new Date().getTime() + "_" + req.files.photo.name;
        req.files.photo.mv("public/admin_assets/" + photo);
    }

    var d = req.body;
    var sql = `INSERT INTO doctor_info (name, specialty, photo) VALUES (?, ?, ?)`;
    await db.query(sql, [d.name, d.specialty, photo]);

    res.redirect("/admin/doctor");
});



router.get("/delete_doctor/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM doctor_info WHERE doctor_id = ?`, [id]);
    res.redirect("/admin/doctor");
});

router.get("/edit_doctor/:id",async function (req,res){
    var id = req.params.id;
    var data = await exe(`SELECT * FROM doctor_info WHERE doctor_id = ${id}`);
    var obj = {"doctor_info":data[0]};
    res.render("admin/edit_doctor.ejs",obj);
});

router.post("/update_doctor/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var photo = d.old_photo;  

    if (req.files) {
        photo = new Date().getTime() + "_" + req.files.photo.name;
        req.files.photo.mv("public/admin_assets/" + photo);
    }

    await exe(`UPDATE doctor_info SET photo = '${photo}', name = '${d.name}', specialty = '${d.specialty}' WHERE doctor_id = ${id}`);
    
    res.redirect("/admin/doctor");
});

// countdown

router.get("/countdown", async function(req,res){
    var countdown = await exe(`SELECT * FROM countdown`)
    res.render("admin/countdown.ejs",{countdown});
});

router.post("/save_countdown", async function(req,res){
    let image = "";
    if (req.files && req.files.image) {
        image = new Date().getTime() + "_" + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    var d = req.body;
    var sql = `INSERT INTO countdown (name, info, image) VALUES (?, ?, ?)`;
    await db.query(sql, [d.name, d.info, image]);

    res.redirect("/admin/countdown");
});

router.get("/delete_countdown/:id", async function (req, res) {
    const id = req.params.id;
    await exe(`DELETE FROM countdown WHERE countdown_id = ?`, [id]);
    res.redirect("/admin/countdown");
});

router.get("/edit_countdown/:id",async function (req,res){
    var id = req.params.id;
    var data = await exe(`SELECT * FROM countdown WHERE countdown_id = ${id}`);
    var obj = {"countdown":data[0]};
    res.render("admin/edit_countdown.ejs",obj);
});

router.post("/update_countdown/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var image = d.old_image;  

    if (req.files) {
        image = new Date().getTime() + "_" + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    await exe(`UPDATE countdown SET image = '${image}', name = '${d.name}', info = '${d.info}' WHERE countdown_id = ${id}`);
    
    res.redirect("/admin/countdown");
});


// contactform

router.get("/contactform", async function(req,res){
    var contactform = await exe(`SELECT * FROM contactform`)
    res.render("admin/contactform.ejs", {contactform});
});

router.post("/save_contactform", async function(req,res){
    let img = "";
    if (req.files) {
        img = new Date().getTime() + "_" + req.files.img.name;
        req.files.img.mv("public/admin_assets/" + img);
    }

    var d = req.body;
    var sql = `INSERT INTO contactform (img ,heading ,subheading ,name ,email ,phone , subject ,message ) VALUES (?, ?, ?, ?, ?, ?,?, ?)`;
    await db.query(sql, [img ,d.heading ,d.subheading ,d.name ,d.email ,d.phone , d.subject ,d.message]);

    res.redirect("/admin/contactform");   
});


// youtube vedio

router.get("/youtube", async function(req,res){
    var youtube = await exe(`SELECT * FROM youtube`);
    res.render("admin/youtube.ejs",{youtube});
});

router.post("/save_youtube", async function(req, res) {
    console.log("Received body:", req.body); // Debugging log

    const {video } = req.body;
    var sql = `INSERT INTO youtube ( video ) VALUES ( ?)`;
    await exe(sql, [ video  ]);

    res.redirect("/admin/youtube");
});

router.get("/delete_youtube/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM youtube WHERE id = ?`, [id]);
    res.redirect("/admin/youtube");
});


 router.get("/edit_youtube/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM youtube WHERE id = ${id}`);
    res.render("admin/edit_youtube.ejs", { youtube: data[0] });
});

 router.post("/update_youtube/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var video  = d.old_video ;  

    if (req.files && req.files.video ) {
        video  = new Date().getTime() + "_" + req.files.video .name;
        req.files.video .mv("public/admin_assets/" + video );
    }

    await exe(`UPDATE youtube SET video  = '${d.video }' WHERE id = ${id}`);
    
    res.redirect("/admin/youtube");
});


// aboutuspage

router.get("/aboutslider", async function (req, res) {
    const sliders = await exe("SELECT * FROM aboutus");
    res.render("admin/aboutslider.ejs", { aboutslider: sliders });
});

// Save Slider
router.post("/save_aboutslider", async function (req, res) {
    let img = "";
    if (req.files && req.files.img) {
        img = new Date().getTime() + "_" + req.files.img.name;
        req.files.img.mv("public/admin_assets/" + img);
    }

    const { title, info } = req.body;
    const sql = `INSERT INTO aboutus (title, info, img) VALUES (?, ?, ?)`;
    await exe(sql, [title, info, img]);

    res.redirect("/admin/aboutslider");
});

// Edit Slider
router.get("/edit_aboutslider/:id", async function (req, res) {
    const id = req.params.id;
    const slider = await exe(`SELECT * FROM aboutus WHERE aboutus_id = ?`, [id]);

    if (slider.length > 0) {
        res.render("admin/edit_aboutslider.ejs", { aboutslider: slider[0] });
    } else {
        res.redirect("/admin/aboutslider");
    }
});

// Update Slider
router.post("/update_aboutslider", async function (req, res) {
    const { id, title, info } = req.body;
    let sql = `UPDATE aboutus SET title = ?, info = ? WHERE id = ?`;

    if (req.files && req.files.img) {
        let img = new Date().getTime() + "_" + req.files.img.name;
        req.files.img.mv("public/admin_assets/" + img);
        sql = `UPDATE aboutus SET title = ?, info = ?, img = ? WHERE id = ?`;
        await exe(sql, [title, info, img, id]);
    } else {
        await exe(sql, [title, info, aboutus_id]);
    }

    res.redirect("/admin/aboutslider");
});

// Delete Slider
router.get("/delete_aboutslider/:id", async function (req, res) {
    const id = req.params.id;
    await exe(`DELETE FROM aboutus WHERE id = ?`, [id]);
    res.redirect("/admin/aboutslider");
});



//vision&mission
 router.get("/vision", async function (req, res) {
    const visions = await exe("SELECT * FROM aboutinfo");
    res.render("admin/vision.ejs", { aboutInfo: visions });
});

// Save Vision Info
router.post("/save_aboutinfo", async function (req, res) {
    let paimg1 = "";
    let drimg2 = "";

    // Image 1 Upload
    if (req.files && req.files.paimg1) {
        paimg1 = new Date().getTime() + "_" + req.files.paimg1.name;
        req.files.paimg1.mv("public/admin_assets/" + paimg1);
    }

    // Image 2 Upload
    if (req.files && req.files.drimg2) {
        drimg2 = new Date().getTime() + "_" + req.files.drimg2.name;
        req.files.drimg2.mv("public/admin_assets/" + drimg2);
    }

    // Get Other Form Data
    const { title1, information, title2, information2, title3, information3 } = req.body;

    // Insert Query
    const sql = `INSERT INTO aboutinfo (paimg1, title1, information, drimg2, title2, information2, title3, information3) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await exe(sql, [paimg1, title1, information, drimg2, title2, information2, title3, information3]);

    res.redirect("/admin/vision");
});

// Edit Vision
router.get("/edit_aboutinfo/:id", async function (req, res) {
    try {
        const about = await exe("SELECT * FROM aboutinfo WHERE id = ?", [req.params.id]);
        res.render("admin/edit_aboutinfo.ejs", { about: about[0] }); // Issue here
    } catch (error) {
        console.error("Error fetching aboutinfo for edit:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Update Vision Info
router.post("/update_aboutinfo/:id", async function (req, res) {
    try {
        const id = req.params.id;
        const { title1, information, title2, information2, title3, information3 } = req.body;

        let sql = `UPDATE aboutinfo SET title1 = ?, information = ?, title2 = ?, information2 = ?, title3 = ?, information3 = ? WHERE id = ?`;
        let values = [title1, information, title2, information2, title3, information3, id];

        // If images are uploaded, update them
        if (req.files && (req.files.paimg1 || req.files.drimg2)) {
            let updateFields = [];
            
            if (req.files.paimg1) {
                let paimg1 = new Date().getTime() + "_" + req.files.paimg1.name;
                req.files.paimg1.mv("public/admin_assets/" + paimg1);
                updateFields.push("paimg1 = ?");
                values.push(paimg1);
            }

            if (req.files.drimg2) {
                let drimg2 = new Date().getTime() + "_" + req.files.drimg2.name;
                req.files.drimg2.mv("public/admin_assets/" + drimg2);
                updateFields.push("drimg2 = ?");
                values.push(drimg2);
            }

            sql = `UPDATE aboutinfo SET title1 = ?, information = ?, title2 = ?, information2 = ?, title3 = ?, information3 = ?, ${updateFields.join(", ")} WHERE id = ?`;
        }

        await exe(sql, values);
        res.redirect("/admin/vision");
    } catch (error) {
        console.error("Error updating aboutinfo:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Delete Vision Info
router.get("/delete_aboutinfo/:id", async function (req, res) {
    const id = req.params.id;
    await exe("DELETE FROM aboutinfo WHERE id = ?", [id]);
    res.redirect("/admin/vision");
});


// ourspecialistcode
router.get("/specialist", async function(req,res){
    var specialist = await exe("SELECT * FROM  specialists;");  
    res.render("admin/specialist.ejs",{specialist});
});

router.post("/save_specialist",  async function(req,res){
    let photo = "";
    if (req.files && req.files.photo) {
        photo = new Date().getTime() + "_" + req.files.photo.name;
        req.files.photo.mv("public/admin_assets/" + photo);
    }

    var d = req.body;
    var sql = `INSERT INTO specialists (name, specialty, photo) VALUES (?, ?, ?)`;
    await db.query(sql, [d.name, d.specialty, photo]);

    res.redirect("/admin/specialist");   
});

router.get("/delete_specialist/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM specialists WHERE specialist_id = ?`, [id]);
    res.redirect("/admin/specialist");
});


 router.get("/edit_specialist/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM specialists WHERE specialist_id = ${id}`);
    res.render("admin/edit_specialist.ejs", { specialist: data[0] });
});

 router.post("/update_specialist/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var photo = d.old_photo;  

    if (req.files && req.files.photo) {
        photo = new Date().getTime() + "_" + req.files.photo.name;
        req.files.photo.mv("public/admin_assets/" + photo);
    }

    await exe(`UPDATE specialists SET name = '${d.name}', specialty = '${d.specialty}', photo = '${photo}' WHERE specialist_id = ${id}`);
    
    res.redirect("/admin/specialist");
});

 
router.get("/commitment", async function(req, res) {
         var commitment = await exe("SELECT * FROM commitment;"); // `exe()` वापरा
        res.render("admin/commitment.ejs", { commitment });
});


router.post("/save_commitment", async function(req, res) {
    var photo = "";
    
    if (req.files) {
        if (req.files.photo ) {
            photo  = new Date().getTime() + req.files.photo .name;
            req.files.photo .mv("public/admin_assets/" + photo );
        }
    }

    var d = req.body;
    var sql = `INSERT INTO commitment (photo, heading, subheading, commitment1, commitment2, commitment3, commitment4) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

        await exe(sql, [photo, d.heading, d.subheading, d.commitment1, d.commitment2, d.commitment3, d.commitment4]);

    res.redirect("/admin/commitment");
});



router.get("/commitment_list", async function(req, res) {
    var commitment = await exe("SELECT * FROM commitment");
    console.log("Commitment List Data:", commitment); // Debugging साठी
    var obj = { commitment: commitment };
    res.render("admin/commitment.ejs", obj);
});

router.get("/delete_Commitment/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM Commitment WHERE Commitment_id = ?`, [id]);
    res.redirect("/admin/Commitment");
});



router.get("/edit_commitment/:id",async function (req,res){
    var id = req.params.id;
    var data = await exe(`SELECT * FROM commitment WHERE commitment_id = ${id}`);
    var obj = {"commitment":data[0]};
    res.render("admin/edit_commitment.ejs",obj);
});

router.post("/update_commitment/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var { heading, subheading, commitment1, commitment2, commitment3, commitment4 } = req.body;
        
        await exe(`
            UPDATE commitment 
            SET heading = '${heading}', 
                subheading = '${subheading}', 
                commitment1 = '${commitment1}', 
                commitment2 = '${commitment2}', 
                commitment3 = '${commitment3}', 
                commitment4 = '${commitment4}' 
            WHERE commitment_id = ${id}
        `);

        res.redirect("/admin/commitment");
    } catch (error) {
        console.error("Error updating commitment:", error);
        res.redirect("/admin/commitment");
    }
});

router.get("/client",async function(req,res){
    var reviews = await exe("SELECT * FROM review");  
    res.render("admin/client.ejs", { reviews });
 });

 router.post("/save_review", async function(req, res) {
    var client_photo = "";
    
    if (req.files) {
        if (req.files.client_photo ) {
            client_photo  = new Date().getTime() + req.files.client_photo .name;
            req.files.client_photo .mv("public/admin_assets/" + client_photo );
        }
    }

    var d = req.body;
    var sql = `INSERT INTO review  (client_review , client_photo, client_name) 
                   VALUES (?, ?, ?)`;

        await exe(sql, [ d.client_review,client_photo, d.client_name]);

    res.redirect("/admin/client");
});

router.get("/delete_review/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM review  WHERE review_id = ?`, [id]);
    res.redirect("/admin/client");
});



// servicepagestart

router.get("/serviceslider", async function(req,res){
    var services =  await exe(`SELECT * FROM service`);
    res.render("admin/service.ejs",{services})
});

router.post("/save_service", async function(req,res){
    let image = "";
    if (req.files && req.files.image) {
        image = new Date().getTime() + "_" + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    var d = req.body;
    var sql = `INSERT INTO service (subheading,heading,information,image) VALUES (?, ?, ?, ?)`;
    await db.query(sql, [d.subheading, d.heading, d.information, image]);

    res.redirect("/admin/serviceslider");   
});

router.get("/delete_service/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM service WHERE service_id = ?`, [id]);
    res.redirect("/admin/serviceslider");
});

router.get("/edit_service/:id",async function (req,res){
    var id = req.params.id;
    var data = await exe(`SELECT * FROM service WHERE service_id = ${id}`);
    var obj = {"service":data[0]};
    res.render("admin/edit_service.ejs",obj);
});

router.post("/update_service/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var image = d.old_image;  

    if (req.files && req.files.image) {
        image = new Date().getTime() + "_" + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    await exe(`UPDATE service SET subheading = '${d.subheading}', heading = '${d.heading}', information = '${d.information}' ,image = '${image}' WHERE service_id = ${id}`);
    
    res.redirect("/admin/service");
});

// facilities/services

router.get("/facility", async function(req,res){
    var facilities = await exe("SELECT * FROM facility");  
    res.render("admin/facility.ejs",{facilities});
});

router.post("/save_facility", async function(req,res){
    let image = "";
    if (req.files && req.files.image) {
        image = new Date().getTime() + "_" + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    var d = req.body;
    var sql = `INSERT INTO facility (main_heading,image,name,info) VALUES (?, ?, ?, ?)`;
    await db.query(sql, [d.main_heading, image, d.name, d.info]);

    res.redirect("/admin/facility");   
});

router.get("/delete_facility/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM facility WHERE facility_id = ?`, [id]);
    res.redirect("/admin/facility");
});


router.get("/edit_facility/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM facility WHERE facility_id = ${id}`);
    res.render("admin/edit_facility.ejs", { facility: data[0] });
});

 router.post("/update_facility/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var image = d.old_image;  

    if (req.files && req.files.image) {
        image = new Date().getTime() + "_" + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    await exe(`UPDATE facility SET main_heading = '${d.main_heading}', image = '${image}', name = '${d.name}', info = '${d.info}' WHERE  facility_id = ${id}`);
    
    res.redirect("/admin/facility");
});


// gallerypage

router.get("/galleryslider", async function(req,res){
    var gallery = await exe(`SELECT * FROM gallery`)
    res.render("admin/galleryslider.ejs",{gallery});
});

router.post("/save_gallery", async function(req,res){
    let image = "";
    if (req.files && req.files.image) {
        image = new Date().getTime() + "_" + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    var d = req.body;
    var sql = `INSERT INTO gallery (image, gallery_heading, gallery_info) VALUES (?, ?, ?)`;
    await db.query(sql, [image,d.gallery_heading, d.gallery_info]);

    res.redirect("/admin/galleryslider");   
});

router.get("/delete_gallery/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM gallery WHERE gallery_id = ?`, [id]);
    res.redirect("/admin/galleryslider");
});


router.get("/edit_gallery/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM gallery WHERE gallery_id = ${id}`);
    res.render("admin/edit_gallery.ejs", { gallery: data[0] });
});

 router.post("/update_gallery/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var image = d.old_image;  

    if (req.files && req.files.image) {
        image = new Date().getTime() + "_" + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    await exe(`UPDATE gallery SET image = '${image}', gallery_heading = '${d.gallery_heading}', gallery_info = '${d.gallery_info}' WHERE  gallery_id = ${id}`);
    
    res.redirect("/admin/galleryslider");
});


router.get("/galleryimage", async function(req,res){
    var gallery_image = await exe(`SELECT * FROM gallery_image`)
    res.render("admin/galleryimage.ejs",{gallery_image})
});

router.post("/save_gallery_image", async function(req,res){
    let image1 = "";

    if (req.files && req.files.image1) {
        image1 = new Date().getTime() + "_" + req.files.image1.name;
        req.files.image1.mv("public/admin_assets/" + image1);
    }
     

    var d = req.body;
    var sql = `INSERT INTO gallery_image (image1) VALUES (?)`;
    await db.query(sql, [image1]);

    res.redirect("/admin/galleryimage");   
});

router.get("/delete_gallery_image/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM gallery_image WHERE gallery_image_id = ?`, [id]);
    res.redirect("/admin/galleryimage");
});

router.get("/edit_gallery_image/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM gallery_image WHERE gallery_image_id = ${id}`);
    res.render("admin/edit_gallery_image.ejs", { gallery_image: data[0] });
});

 router.post("/update_gallery_image/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var image1 = d.old_image1;  

    if (req.files && req.files.image1) {
        image1 = new Date().getTime() + "_" + req.files.image1.name;
        req.files.image1.mv("public/admin_assets/" + image1);
    }

    await exe(`UPDATE gallery_image SET image1 = '${image1}', WHERE  gallery_image_id = ${id}`);
    
    res.redirect("/admin/galleryimage");
});


// insurencepage

router.get("/insurenceslider", async function(req,res){
    var insurenceslider = await exe(`SELECT * FROM insurenceslider`)
    res.render("admin/insurence.ejs",{insurenceslider});
});

    
router.post("/save_insurance_slider", async function(req,res){
    let insurence_img  = "";

    if (req.files && req.files.insurence_img ) {
        insurence_img  = new Date().getTime() + "_" + req.files.insurence_img .name;
        req.files.insurence_img .mv("public/admin_assets/" + insurence_img );
    }
     

    var d = req.body;
    var sql = `INSERT INTO insurenceslider (insurence_img, insurence_title , insurence_subtitle ) VALUES (?, ?, ?)`;
    await db.query(sql, [insurence_img, d.insurence_title, d.insurence_subtitle]);

    res.redirect("/admin/insurenceslider");   
});

router.get("/delete_insurance_slider/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM insurenceslider WHERE insurenceslider_id  = ?`, [id]);
    res.redirect("/admin/insurenceslider");
});

router.get("/edit_insurance_slider/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM insurenceslider WHERE insurenceslider_id = ${id}`);
    res.render("admin/edit_insurance_slider.ejs", {insurenceslider: data[0] });
});

 router.post("/update_insurance_slider/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var insurence_img = d.old_insurence_img;  

    if (req.files && req.files.insurence_img) {
        insurence_img = new Date().getTime() + "_" + req.files.insurence_img.name;
        req.files.insurence_img.mv("public/admin_assets/" + insurence_img);
    }

    await exe(`UPDATE insurenceslider SET insurence_img = '${insurence_img}',insurence_title = '${d.insurence_title}', insurence_subtitle = '${d.insurence_subtitle}' WHERE  insurenceslider_id  = ${id}`);
    
    res.redirect("/admin/insurenceslider");
});

router.get("/insurenceplan", async function(req,res){
    var insuranceplans = await exe(`SELECT * FROM insurenceplan `)
    res.render("admin/insurenceplan.ejs",{insuranceplans });
});

router.post("/save_insurance_plan",  async function(req,res){
   
    var d = req.body;
    var sql = `INSERT INTO insurenceplan (plan_name , plan_info, plan_price  ) VALUES ( ?, ?, ?)`;
    await db.query(sql, [d.plan_name , d.plan_info, d.plan_price ]);

    res.redirect("/admin/insurenceplan");
});

router.get("/delete_insurance_plan/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM insurenceplan WHERE insurenceplan_id  = ?`, [id]);
    res.redirect("/admin/insurenceplan");
});

router.get("/edit_insurance_plan/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM insurenceplan WHERE insurenceplan_id = ${id}`);
    res.render("admin/edit_insurance_plan.ejs", {insurenceplan: data[0] });
});

 router.post("/update_insurance_plan/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;

    await exe(`UPDATE insurenceplan SET plan_name = '${d.plan_name}', plan_info = '${d.plan_info}', plan_price = '${d.plan_price}'  WHERE  insurenceplan_id  = ${id}`);
    
    res.redirect("/admin/insurenceplan");
});
 


// blogcode
router.get("/blogslider",  async function(req,res){
    var blogslider = await exe(`SELECT * FROM blogslider`)
    res.render("admin/blogslider.ejs",{blogslider});
});

router.post("/save_blogslider", async function(req,res){
    let image  = "";

    if (req.files && req.files.image ) {
        image  = new Date().getTime() + "_" + req.files.image .name;
        req.files.image .mv("public/admin_assets/" + image );
    }
     

    var d = req.body;
    var sql = `INSERT INTO blogslider (image) VALUES (?)`;
    await db.query(sql, [image]);

    res.redirect("/admin/blogslider");   
});

router.get("/delete_blogslider/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM blogslider WHERE blogslider_id  = ?`, [id]);
    res.redirect("/admin/blogslider");
});

router.get("/edit_blogslider/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM blogslider WHERE blogslider_id = ${id}`);
    res.render("admin/edit_blogslider.ejs", {blogslider: data[0] });
});

 router.post("/update_blogslider/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var image = d.old_image;  

    if (req.files && req.files.image) {
        image = new Date().getTime() + "_" + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    await exe(`UPDATE blogslider SET image = '${image}' WHERE  blogslider_id  = ${id}`);
    
    res.redirect("/admin/blogslider");
});


router.get("/addblog", async function(req,res){
    var blogs = await exe(`SELECT * FROM blogs `)
    res.render("admin/addblog.ejs",{blogs});
});

router.post("/save_blog", async function(req,res){
    let blogimage  = "";
    if (req.files && req.files.blogimage ) {
        blogimage  = new Date().getTime() + "_" + req.files.blogimage .name;
        req.files.blogimage .mv("public/admin_assets/" + blogimage );
    }

    var d = req.body;
    var sql = `INSERT INTO blogs (blogimage , blogname , blogheading , bloginfo ) VALUES (?, ?, ?, ?)`;
    await db.query(sql, [blogimage, d.blogname, d.blogheading, d.bloginfo]);

    res.redirect("/admin/addblog");   
});
    

router.get("/delete_blog/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM blogs WHERE blogs_id  = ?`, [id]);
    res.redirect("/admin/addblog");
});


router.get("/edit_blog/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM blogs WHERE blogs_id  = ${id}`);
    res.render("admin/edit_blog.ejs", { blogs: data[0] });
});

 router.post("/update_blog/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var blogimage = d.old_blogimage;  

    if (req.files && req.files.blogimage) {
        blogimage = new Date().getTime() + "_" + req.files.blogimage.name;
        req.files.blogimage.mv("public/admin_assets/" + blogimage);
    }

    await exe(`UPDATE blogs SET blogimage = '${blogimage}', blogname = '${d.blogname}', blogheading = '${d.blogheading}', bloginfo = '${d.bloginfo}' WHERE  blogs_id = ${id}`);
    
    res.redirect("/admin/addblog");
});

// contactpagestart

router.get("/contactslider", async function(req,res){
    var contactslider = await exe(`SELECT * FROM contactslider`)
    res.render("admin/contactslider.ejs",{contactslider});
});

router.post("/save_contactslider", async function(req,res){
    let contactimage   = "";

    if (req.files && req.files.contactimage  ) {
        contactimage  = new Date().getTime() + "_" + req.files.contactimage.name;
        req.files.contactimage  .mv("public/admin_assets/" + contactimage);
    }
     

    var d = req.body;
    var sql = `INSERT INTO contactslider (contactimage, contacttitle ) VALUES (?, ?)`;
    await db.query(sql, [contactimage, d.contacttitle ]);

    res.redirect("/admin/contactslider");   
});

router.get("/delete_contactslider/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM contactslider WHERE contactslider_id = ?`, [id]);   
    res.redirect("/admin/contactslider");
});

router.get("/edit_contactslider/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM contactslider WHERE contactslider_id = ${id}`);
    res.render("admin/edit_contactslider.ejs", {contactslider : data[0] });
});

router.post("/update_contactslider/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var contactimage = d.old_image;  

    if (req.files && req.files.image) {
        image = new Date().getTime() + "_" + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    await exe(`UPDATE contactslider SET contactimage = '${contactimage}', contacttitle = '${d.contacttitle}'  WHERE  contactslider_id  = ${id}`);
    
    res.redirect("/admin/contactslider");
});





router.get("/contactcards", async function(req,res){
    var contactsource = await exe(`SELECT * FROM contactsource `)
    res.render("admin/contactcard.ejs",{contactsource });
});

router.post("/save_contactcards", async function(req,res){
    let image  = "";
    if (req.files && req.files.image ) {
        image  = new Date().getTime() + "_" + req.files.image .name;
        req.files.image .mv("public/admin_assets/" + image );
    }

    var d = req.body;
    var sql = `INSERT INTO contactsource (image , heading , info1 , info2 ) VALUES (?, ?, ?, ?)`;
    await db.query(sql, [image, d.heading, d.info1, d.info2]);

    res.redirect("/admin/contactcards");   
});

router.get("/delete_contactcards/:id", async function(req, res) {
    let id = req.params.id;
    await exe(`DELETE FROM contactsource WHERE contactsource_id = ?`, [id]);  // Ensure 'id' matches DB column name
    res.redirect("/admin/contactcards");
});


router.get("/edit_contactcards/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM contactsource WHERE contactsource_id = ${id}`);
    res.render("admin/edit_contactcards.ejs", {contactsource : data[0] });
});

 router.post("/update_contactcards/:id", async function (req, res) {
    var id = req.params.id;
    var d = req.body;
    var image = d.old_image;  

    if (req.files && req.files.image) {
        image = new Date().getTime() + "_" + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    await exe(`UPDATE contactsource SET image = '${image}', heading = '${d.heading}',  info1 = '${d.info1}', info2 = '${d.info2}' WHERE  contactsource_id  = ${id}`);
    
    res.redirect("/admin/contactcards");
});


// contactpage

 router.get("/contactforms", async function(req,res){
    var forms = await exe(`SELECT * FROM form`)
    res.render("admin/contactforms.ejs",{forms});
 });

 router.post("/save_forms", function(req,res){
    res.send(req.body);
 });


//  appointmentform

router.get("/appointment", async function(req,res){
    var appointments  = await exe(`SELECT * FROM appointment`)
    res.render("admin/appointment.ejs",{appointments})
});

router.post("/save_appointment", function(req,res){
    res.send(req.body);
});
module.exports = router;



 