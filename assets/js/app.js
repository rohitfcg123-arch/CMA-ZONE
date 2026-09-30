const $=s=>document.querySelector(s);
const menuBtn=$("#menuBtn"), mobileNav=$("#mobileNav"), notificationBtn=$("#notificationBtn"), badge=$("#notificationBadge"), toast=$("#toast");
menuBtn?.addEventListener("click",()=>mobileNav.classList.toggle("open"));
mobileNav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mobileNav.classList.remove("open")));
notificationBtn?.addEventListener("click",()=>showToast("Notifications will be connected to the CMA Zone CMS."));
function showToast(message){toast.textContent=message;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2200)}

const mcqData={
  "Foundation":[],
  "Inter Group 1":[],
  "Inter Group 2":[],
  "Final Group 3":[],
  "Final Group 4":[]
};
const group=$("#mcqGroup"), subject=$("#mcqSubject"), chapter=$("#mcqChapter");
function fill(select,items,placeholder){
  select.innerHTML="<option value=\"\">"+placeholder+"</option>";
  items.forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;select.appendChild(o);});
  select.disabled=items.length===0;
}
group?.addEventListener("change",()=>{
  fill(subject,mcqData[group.value]||[],"Select Subject");
  fill(chapter,[],"Select Chapter");
});
subject?.addEventListener("change",()=>fill(chapter,[],"Select Chapter"));
window.CMAZone={version:"0.1.1",theme:"global",showToast};
