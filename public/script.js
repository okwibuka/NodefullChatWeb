

// ------------------------------create post----------------------------------------

const create_img_post_container = document.querySelector(".create_img_post_container");
const create_img_post = document.querySelector(".create_img_post");
const close_img = document.querySelector(".close_img_post");

create_img_post_container.classList.add("hidden");

create_img_post.addEventListener("click" ,function()
{
create_img_post_container.classList.remove("hidden");

})

close_img.addEventListener("click" ,function()
{
create_img_post_container.classList.add("hidden"); 

})


// ..............................news box........................................................

const news_card = document.querySelector(".box_one_news");
const close_news_card = document.querySelector(".close_news");
const box_two = document.querySelector(".box_two");


close_news_card.addEventListener("click" ,function()
{
news_card.classList.add("hidden"); 
box_two.style.border="none";

})

// ..................................comments box...................................

const comment_box = document.querySelector('.comments_container')
const close_comment = document.querySelector('.close_comment_container')
const openComment = document.querySelector('.comment_view_btn')

comment_box.classList.add('hidden')
openComment.addEventListener('click' , ()=>{
comment_box.classList.remove('hidden')
})

close_comment.addEventListener('click' , ()=>{
comment_box.classList.add('hidden')
})
