const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);  
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings  = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//show route
router.get("/:id", async (req, res) => {
 let { id } = req.params;
 const listing = await Listing.findById(id).populate("reviews");
 res.render("listings/show.ejs", { listing });
 });

// router.get("/:id", wrapAsync(async (req, res) => {
//     try {
//         const { id } = req.params;
//         const listing = await Listing.findById(id).populate("reviews");
//         res.render("listings/show.ejs", { listing }); // Changed from prependListener() to render()
//     } catch (err) {
//         res.status(500).send("Error retrieving listing");
//     }
// }));

//Create Route
router.post("/",validateListing, wrapAsync (async (req, res, next) => {
    let result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error) {
        throw new ExpressError(400, result.error);
    }
    const newListing = new Listing(req.body.listing);        
    await newListing.save();
    res.redirect("/listings");
})
);

//Edit Route
router.get("/:id/edit", wrapAsync (async (req, res) => {
let { id } = req.params;
const listing = await Listing.findById(id);
res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id",validateListing, wrapAsync (async (req, res) => {
let { id } = req.params;
await Listing.findByIdAndUpdate(id, {...req.body.listing});
res.redirect('/listings');
}));

//DELETE Route
router.delete("/:id", wrapAsync(async (req, res) => {
let { id } = req.params;
let deletedListing = await Listing.findByIdAndDelete(id);
console.log(deletedListing);
res.redirect("/listings");
}));


module.exports = router;