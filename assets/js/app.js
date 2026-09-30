const $=s=>document.querySelector(s);
const menuBtn=$("#menuBtn"), mobileNav=$("#mobileNav"), notificationBtn=$("#notificationBtn"), badge=$("#notificationBadge"), toast=$("#toast");
menuBtn?.addEventListener("click",()=>mobileNav.classList.toggle("open"));
mobileNav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mobileNav.classList.remove("open")));
notificationBtn?.addEventListener("click",()=>showToast("Notifications will be connected to the CMA Zone CMS."));
function showToast(message){toast.textContent=message;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2200)}
window.CMAZone={version:"0.1.0",theme:"global",showToast};