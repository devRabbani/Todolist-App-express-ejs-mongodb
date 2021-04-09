const express = require("express");
const bodyParser=require("body-parser");
const mongoose = require('mongoose');
const _ =require('loadash');


const app=express();
app.set('view engine',"ejs"); 
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema={
    name:String
}

const Item=mongoose.model(
   "item",
   itemsSchema
);

const item1 = new Item({
    name:"Welcome to our todo"
})
const item2 = new Item({
    name:"Buy Milk"
})

const item3 = new Item({
    name:"Drink Pepsi"
})

const arrayList=[item1,item2,item3];

const listSchema={
    name: String,
    items:[itemsSchema]
}

const List= mongoose.model("List",listSchema)


app.get("/", (req, res) => {
    Item.find({}, (err, result) => {
        if (result.length === 0) {
            Item.insertMany(arrayList, err => {
                if(err){
                    console.log(err);
                }   
            })
            res.redirect("/")
        } else {
            res.render('index', {
                listTitle: "Today",
                newList: result
            });
        }
    })
})


app.post('/',(req,res)=>{
    const itemName=req.body.newItem 
    const listName=req.body.list
    const item =new Item({
        name:itemName
    }); 


    if(listName==="Today"){
        item.save()
        res.redirect("/")
    }else{
        List.findOne({name:listName},(err,result)=>{
            result.items.push(item);
            result.save()
            res.redirect("/"+listName)
        })
     
    }


})

app.post('/delete',(req,res)=>{
  const itemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(itemId,function(err){
        if(!err){ 
            console.log("Succesfully Deleted");
            res.redirect("/")
        }else{
            console.log(err);
        }
    });
  
    
  }else{
      List.findOneAndUpdate(
          {name:listName},
          {$pull : {items:{_id:itemId}}},
          (err,result)=>{
              if(!err){
                  res.redirect('/'+listName)
              }
          }
      )
  }
  
  


});


app.get('/:list',(req,res)=>{
    const listname=_.capitalize(req.params.list);

    List.findOne({name:listname},(err,result)=>{
        if(!err){
            if(!result){
                const list=new List({
                    name:listname,
                    items:arrayList
                })
                list.save();
                res.redirect("/"+listname);
            }else[
                res.render("index",{listTitle:listname,newList:result.items})
            ]
        }
    })
  

})

app.listen(3000,()=>{
    console.log("Server started at 3000");
})