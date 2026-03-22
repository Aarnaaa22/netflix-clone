import { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   GLOBAL CSS
   ============================================================ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;500;600;700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: #141414; color: #fff;
    font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
    overflow-x: hidden; -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { height: 3px; width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e50914; border-radius: 4px; }

  /* ── ROW TRACK ── */
  .row-track {
    display: flex; gap: 6px; overflow-x: auto; overflow-y: visible;
    padding: 16px 4px 32px; scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch; scrollbar-width: none;
  }
  .row-track::-webkit-scrollbar { display: none; }

  /* ── CARD ── */
  .card-wrap {
    flex: 0 0 auto; border-radius: 5px; overflow: visible;
    position: relative; cursor: pointer; scroll-snap-align: start;
    transition: transform 0.38s cubic-bezier(.25,.46,.45,.94), z-index 0s 0.38s;
    transform-origin: center center;
    width: 220px;
  }
  .card-inner {
    width: 100%; border-radius: 6px;
    overflow: hidden; background: #1c1c1c;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    transition: box-shadow 0.38s ease;
  }
  .card-wrap:hover {
    transform: scale(1.0) translateY(-8px);
    z-index: 99;
    transition: transform 0.38s cubic-bezier(.25,.46,.45,.94), z-index 0s 0s;
  }
  .card-wrap:hover .card-inner {
    box-shadow: 0 20px 60px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.08);
    border-radius: 6px 6px 0 0;
  }
  .card-wrap:first-child { transform-origin: left center; }
  .card-wrap:last-child  { transform-origin: right center; }

  .card-img {
    width: 100%; height: 124px;
    object-fit: cover; display: block;
    background: #1c1c1c;
    transition: filter 0.3s ease;
  }
  .card-wrap:hover .card-img { filter: brightness(0.65); }

  /* ── EXPANDED CARD PANEL (Netflix-style) ── */
  .card-expand {
    position: absolute; left: 0; right: 0; top: 100%;
    background: #1c1c1c; border-radius: 0 0 6px 6px;
    padding: 10px 12px 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.08);
    opacity: 0; pointer-events: none;
    transform: translateY(-4px);
    transition: opacity 0.28s ease 0.1s, transform 0.28s ease 0.1s;
    z-index: 100;
  }
  .card-wrap:hover .card-expand {
    opacity: 1; pointer-events: all; transform: translateY(0);
  }

  /* ── TOP 10 BADGE ── */
  .top10-badge {
    position: absolute; top: 6px; left: 6px;
    background: #e50914; color: #fff;
    font-size: 9px; font-weight: 800;
    padding: 2px 6px; border-radius: 3px;
    letter-spacing: 0.5px; text-transform: uppercase;
    z-index: 2;
  }

  /* ── NEW BADGE ── */
  .new-badge {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: rgba(70,211,105,0.9); color: #000;
    font-size: 9px; font-weight: 800;
    padding: 3px 0; text-align: center; letter-spacing: 0.5px;
    text-transform: uppercase; z-index: 2;
  }

  .ic-btn {
    width: 30px; height: 30px; border-radius: 50%; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.15s, background 0.15s;
    flex-shrink: 0;
  }
  .ic-btn:hover { transform: scale(1.12); }
  .ic-btn.play  { background: #fff; }
  .ic-btn.ghost {
    background: rgba(32,32,32,0.9);
    border: 1.5px solid rgba(255,255,255,0.5);
  }
  .ic-btn.ghost:hover { border-color: #fff; background: rgba(50,50,50,0.9); }

  .btn-play {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 30px; background: #fff; color: #000;
    border: none; border-radius: 4px; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: inherit; white-space: nowrap;
    transition: background 0.18s, transform 0.12s;
  }
  .btn-play:hover { background: rgba(255,255,255,0.76); transform: scale(1.04); }

  .btn-info {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 30px; background: rgba(109,109,110,0.68); color: #fff;
    border: none; border-radius: 4px; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: inherit; white-space: nowrap;
    transition: background 0.18s, transform 0.12s;
  }
  .btn-info:hover { background: rgba(109,109,110,0.38); transform: scale(1.04); }

  .nav-link {
    color: #b3b3b3; font-size: 13px; cursor: pointer;
    text-decoration: none; transition: color 0.2s;
    white-space: nowrap; font-weight: 500;
  }
  .nav-link:hover, .nav-link.active { color: #fff; }

  .scroll-btn {
    position: absolute; top: 0; height: calc(100% - 32px); width: 52px;
    background: linear-gradient(to right, rgba(20,20,20,0.96) 0%, transparent 100%);
    border: none; cursor: pointer; display: flex; align-items: center;
    justify-content: center; z-index: 10; opacity: 0;
    transition: opacity 0.22s; color: #fff;
  }
  .scroll-btn.right {
    right: 0;
    background: linear-gradient(to left, rgba(20,20,20,0.96) 0%, transparent 100%);
  }
  .row-outer:hover .scroll-btn { opacity: 1; }

  /* ── MODAL ── */
  .modal-bg {
    position: fixed; inset: 0; background: rgba(0,0,0,0.78); z-index: 900;
    display: flex; align-items: center; justify-content: center;
    padding: 20px; animation: bgFade 0.22s ease;
  }
  @keyframes bgFade { from{opacity:0} to{opacity:1} }
  @keyframes boxUp  { from{transform:translateY(32px) scale(0.96);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }

  .modal-box {
    background: #181818; border-radius: 10px; width: 100%;
    max-width: 870px; max-height: 92vh; overflow-y: auto; position: relative;
    animation: boxUp 0.32s cubic-bezier(.25,.46,.45,.94);
  }
  .modal-box::-webkit-scrollbar { width: 4px; }
  .modal-box::-webkit-scrollbar-thumb { background: #333; }

  .modal-x {
    position: absolute; top: 14px; right: 14px;
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(20,20,20,0.9); border: 2px solid #444; color: #fff;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    z-index: 20; transition: background 0.2s, border-color 0.2s;
  }
  .modal-x:hover { background: #2a2a2a; border-color: #777; }

  .maturity {
    display: inline-flex; align-items: center;
    border-left: 3px solid rgba(255,255,255,0.5);
    padding-left: 8px; font-size: 13px; color: rgba(255,255,255,0.85);
  }

  .search-input {
    background: rgba(0,0,0,0.8); border: 1.5px solid rgba(255,255,255,0.65);
    color: #fff; padding: 5px 12px; border-radius: 3px;
    font-size: 13px; width: 220px; outline: none; font-family: inherit;
    transition: border-color 0.2s, width 0.3s;
  }
  .search-input:focus { border-color: #fff; width: 260px; }
  .search-input::placeholder { color: rgba(255,255,255,0.45); }

  .section-anchor { scroll-margin-top: 78px; }

  @keyframes heroIn { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
  .hero-content { animation: heroIn 0.95s cubic-bezier(.25,.46,.45,.94) 0.2s both; }

  @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  .shimmer {
    background: linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%);
    background-size: 600px 100%; animation: shimmer 1.5s infinite linear;
  }

  .footer-link {
    color: #737373; font-size: 12px; cursor: pointer;
    text-decoration: none; transition: color 0.2s; line-height: 2.4; display: block;
  }
  .footer-link:hover { color: #e5e5e5; text-decoration: underline; }

  /* ── PROFILE DROPDOWN ── */
  .profile-menu {
    position: absolute; top: calc(100% + 12px); right: 0;
    background: rgba(22,22,22,0.97); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 5px; min-width: 220px; overflow: hidden;
    animation: bgFade 0.18s ease;
    backdrop-filter: blur(12px);
  }
  .profile-menu::before {
    content: ''; position: absolute; top: -6px; right: 14px;
    border-left: 6px solid transparent; border-right: 6px solid transparent;
    border-bottom: 6px solid rgba(22,22,22,0.97);
  }
  .pmenu-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; font-size: 13px; color: #e5e5e5;
    cursor: pointer; transition: background 0.15s;
  }
  .pmenu-item:hover { background: rgba(255,255,255,0.08); }
  .pmenu-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0; }
  .pmenu-header { padding: 12px 16px 8px; display: flex; align-items: center; gap: 10px; }

  /* ── ACCOUNT PAGE ── */
  .acc-sidebar-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; cursor: pointer; border-radius: 6px;
    font-size: 14px; color: #333; font-weight: 500;
    transition: background 0.15s;
  }
  .acc-sidebar-item:hover { background: #f0f0f0; }
  .acc-sidebar-item.active { font-weight: 700; color: #000; }

  .acc-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid #e5e5e5; cursor: pointer;
    transition: background 0.15s;
  }
  .acc-row:last-child { border-bottom: none; }
  .acc-row:hover { background: #f9f9f9; }

  @media (max-width: 960px) {
    .card-wrap { width: 165px; }
    .card-img  { height: 94px; }
  }
  @media (max-width: 640px) {
    .card-wrap { width: 130px; }
    .card-img  { height: 74px; }
    .card-wrap:hover { transform: scale(1.05) translateY(-4px); }
    .desktop-nav { display: none !important; }
    .btn-play, .btn-info { padding: 9px 16px; font-size: 13px; }
    .hamburger { display: flex !important; }
  }
`;

/* ============================================================
   DATA  — Amazon CDN public posters (no API key)
   ============================================================ */
const MOVIES = {
  trending: [
    { id:1,  top10:true,  newSeason:false, title:"Dune: Part Two",         year:2024, rating:"8.6", match:99, age:"13+", duration:"2h 46m", genre:["Sci-Fi","Adventure","Drama"],   desc:"Paul Atreides unites with Chani and the Fremen while on a path of revenge against those who destroyed his family.", img:"https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NTc5LThlOGQtODhmNDI1NmY5YzAwXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NTc5LThlOGQtODhmNDI1NmY5YzAwXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_SX1000.jpg" },
    { id:2,  top10:true,  newSeason:false, title:"Oppenheimer",             year:2023, rating:"8.3", match:97, age:"16+", duration:"3h 0m",  genre:["Drama","History","Thriller"],  desc:"The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.", img:"https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_SX1000.jpg" },
    { id:3,  top10:false, newSeason:true,  title:"Interstellar",            year:2014, rating:"8.7", match:98, age:"PG",  duration:"2h 49m", genre:["Sci-Fi","Drama","Adventure"],  desc:"A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", img:"https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX1000.jpg" },
    { id:4,  top10:false, newSeason:false, title:"Inception",               year:2010, rating:"8.8", match:98, age:"13+", duration:"2h 28m", genre:["Action","Sci-Fi","Thriller"],  desc:"A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.", img:"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX1000.jpg" },
    { id:5,  top10:true,  newSeason:false, title:"The Dark Knight",         year:2008, rating:"9.0", match:99, age:"13+", duration:"2h 32m", genre:["Action","Crime","Drama"],      desc:"When the Joker wreaks havoc on Gotham, Batman must face his greatest psychological test.", img:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX1000.jpg" },
    { id:6,  top10:false, newSeason:false, title:"Parasite",                year:2019, rating:"8.5", match:96, age:"18+", duration:"2h 12m", genre:["Drama","Thriller","Comedy"],   desc:"Greed and class discrimination threaten the symbiotic relationship between a wealthy family and a destitute one.", img:"https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX1000.jpg" },
    { id:7,  top10:false, newSeason:true,  title:"Everything Everywhere",   year:2022, rating:"7.8", match:93, age:"16+", duration:"2h 19m", genre:["Comedy","Sci-Fi","Action"],    desc:"A middle-aged Chinese immigrant is swept up in an insane adventure where she alone can save the multiverse.", img:"https://m.media-amazon.com/images/M/MV5BYTdiOTIyZTQtNmQ1OS00NjZlLWIyMTgtYzk5Y2M3ZDVmMDk1XkEyXkFqcGdeQXVyMTAzMDg4NzkzNA@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BYTdiOTIyZTQtNmQ1OS00NjZlLWIyMTgtYzk5Y2M3ZDVmMDk1XkEyXkFqcGdeQXVyMTAzMDg4NzkzNA@@._V1_SX1000.jpg" },
    { id:8,  top10:true,  newSeason:false, title:"Poor Things",             year:2023, rating:"7.9", match:94, age:"18+", duration:"2h 21m", genre:["Comedy","Drama","Fantasy"],    desc:"A young woman brought back to life goes on a remarkable journey of self-discovery across Europe.", img:"https://m.media-amazon.com/images/M/MV5BNGIyYWMzNjktNDE3Nl5BMl5BanBnXkFtZTcwOTU4NTMzNA@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNGIyYWMzNjktNDE3Nl5BMl5BanBnXkFtZTcwOTU4NTMzNA@@._V1_SX1000.jpg" },
    { id:9,  top10:false, newSeason:false, title:"Saltburn",                year:2023, rating:"7.1", match:86, age:"18+", duration:"2h 7m",  genre:["Drama","Thriller","Mystery"],  desc:"A student at Oxford is seduced into the eccentric world of a charming aristocratic classmate.", img:"https://m.media-amazon.com/images/M/MV5BMWQ4MzI2ZDQtYjk3MS00ZjQ0LWJkNTgtMTNiMGJjNzYxNTIxXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMWQ4MzI2ZDQtYjk3MS00ZjQ0LWJkNTgtMTNiMGJjNzYxNTIxXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_SX1000.jpg" },
    { id:10, top10:false, newSeason:true,  title:"The Holdovers",           year:2023, rating:"8.0", match:95, age:"16+", duration:"2h 13m", genre:["Comedy","Drama"],              desc:"A curmudgeonly professor stuck on campus over holidays forms an unlikely bond with a troubled student.", img:"https://m.media-amazon.com/images/M/MV5BNTk4NTkzNDktZTMwNy00YjU4LTkyZTQtNTkxN2YxNzFlOGNiXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNTk4NTkzNDktZTMwNy00YjU4LTkyZTQtNTkxN2YxNzFlOGNiXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_SX1000.jpg" },
  ],
  topRated: [
    { id:11, top10:true,  newSeason:false, title:"The Shawshank Redemption",year:1994, rating:"9.3", match:99, age:"16+", duration:"2h 22m", genre:["Drama"],                       desc:"Two convicts form a friendship and find solace through acts of common decency inside a harsh prison.", img:"https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NiYyLTg3YzItOTQ3ZDI3NWZiMzNlXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NiYyLTg3YzItOTQ3ZDI3NWZiMzNlXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX1000.jpg" },
    { id:12, top10:true,  newSeason:false, title:"The Godfather",           year:1972, rating:"9.2", match:99, age:"18+", duration:"2h 55m", genre:["Crime","Drama"],               desc:"The patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.", img:"https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX1000.jpg" },
    { id:13, top10:false, newSeason:false, title:"Schindler's List",        year:1993, rating:"9.0", match:99, age:"18+", duration:"3h 15m", genre:["Drama","History","War"],       desc:"Oskar Schindler shelters over a thousand Jewish workers in his factories, saving them from Nazi concentration camps.", img:"https://m.media-amazon.com/images/M/MV5BNJM4NDY3OTA5OF5BMl5BanBnXkFtZTgwNzEzMDcwMjE@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNJM4NDY3OTA5OF5BMl5BanBnXkFtZTgwNzEzMDcwMjE@._V1_SX1000.jpg" },
    { id:14, top10:false, newSeason:false, title:"Pulp Fiction",            year:1994, rating:"8.9", match:97, age:"18+", duration:"2h 34m", genre:["Crime","Drama"],               desc:"The lives of two mob hitmen intertwine in four tales of violence and redemption.", img:"https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX1000.jpg" },
    { id:15, top10:false, newSeason:false, title:"Fight Club",              year:1999, rating:"8.8", match:96, age:"18+", duration:"2h 19m", genre:["Drama","Thriller"],            desc:"An insomniac and a soap salesman build a global underground fight club that becomes something much darker.", img:"https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX1000.jpg" },
    { id:16, top10:false, newSeason:false, title:"Whiplash",                year:2014, rating:"8.5", match:97, age:"16+", duration:"1h 47m", genre:["Drama","Music"],               desc:"A young drummer pursues greatness at a cutthroat conservatory where a brutal instructor pushes him to his limits.", img:"https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX1000.jpg" },
    { id:17, top10:false, newSeason:false, title:"Forrest Gump",            year:1994, rating:"8.8", match:96, age:"PG",  duration:"2h 22m", genre:["Drama","Romance"],             desc:"The life story of a slow-witted but kindhearted man from Alabama who witnesses key historical events.", img:"https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX1000.jpg" },
    { id:18, top10:true,  newSeason:false, title:"Interstellar",            year:2014, rating:"8.7", match:98, age:"PG",  duration:"2h 49m", genre:["Sci-Fi","Drama"],              desc:"A team of astronomers travel through a wormhole near Saturn to ensure humanity's survival.", img:"https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX1000.jpg" },
    { id:19, top10:false, newSeason:false, title:"Good Will Hunting",       year:1997, rating:"8.3", match:95, age:"16+", duration:"2h 6m",  genre:["Drama","Romance"],             desc:"A janitor at MIT has a gift for mathematics but needs help from a psychologist to find direction in life.", img:"https://m.media-amazon.com/images/M/MV5BOTU2NjU0OGUtMGU2Ny00ZmVlLTg5ZjMtZGYxMzVkMjkxMGViXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BOTU2NjU0OGUtMGU2Ny00ZmVlLTg5ZjMtZGYxMzVkMjkxMGViXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX1000.jpg" },
    { id:20, top10:false, newSeason:false, title:"The Silence of the Lambs",year:1991, rating:"8.6", match:94, age:"18+", duration:"1h 58m", genre:["Crime","Thriller","Drama"],   desc:"A young F.B.I. cadet seeks help from a brilliant, imprisoned cannibal killer to catch another serial killer.", img:"https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX1000.jpg" },
  ],
  action: [
    { id:21, top10:false, newSeason:false, title:"Mad Max: Fury Road",      year:2015, rating:"8.1", match:93, age:"18+", duration:"2h 0m",  genre:["Action","Adventure","Sci-Fi"], desc:"In a post-apocalyptic wasteland, Max teams with Furiosa to flee a warlord and his army.", img:"https://m.media-amazon.com/images/M/MV5BN2EwM2I5OWMtMGQyMi00Zjg1LWJkNTctZTdjYTA4OGUwZjMyXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BN2EwM2I5OWMtMGQyMi00Zjg1LWJkNTctZTdjYTA4OGUwZjMyXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX1000.jpg" },
    { id:22, top10:true,  newSeason:false, title:"John Wick: Chapter 4",    year:2023, rating:"7.7", match:92, age:"18+", duration:"2h 49m", genre:["Action","Thriller","Crime"],   desc:"John Wick uncovers a path to defeating the High Table, facing a powerful new enemy with global alliances.", img:"https://m.media-amazon.com/images/M/MV5BMDExZGMyOTMtMDgyYi00NGIwLWJhMTEtOTdkZGFjNmZiMTEwXkEyXkFqcGdeQXVyMjM4NTM5NDY@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMDExZGMyOTMtMDgyYi00NGIwLWJhMTEtOTdkZGFjNmZiMTEwXkEyXkFqcGdeQXVyMjM4NTM5NDY@._V1_SX1000.jpg" },
    { id:23, top10:false, newSeason:false, title:"Top Gun: Maverick",       year:2022, rating:"8.3", match:95, age:"PG",  duration:"2h 17m", genre:["Action","Drama"],              desc:"After 30 years, Maverick is called back to train a new generation of Top Gun graduates for a near-impossible mission.", img:"https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_SX1000.jpg" },
    { id:24, top10:false, newSeason:false, title:"Avengers: Endgame",       year:2019, rating:"8.4", match:96, age:"13+", duration:"3h 2m",  genre:["Action","Sci-Fi","Adventure"], desc:"The Avengers assemble one final time to reverse Thanos' devastating snap and restore the universe.", img:"https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_SX1000.jpg" },
    { id:25, top10:false, newSeason:false, title:"The Batman",              year:2022, rating:"7.9", match:93, age:"16+", duration:"2h 56m", genre:["Action","Crime","Drama"],      desc:"Batman ventures into Gotham's underworld when a sadistic killer leaves cryptic clues targeting the city's elite.", img:"https://m.media-amazon.com/images/M/MV5BMDdmMTBiNTYtMDIzNi00NGVlLWIzMDYtZTk3MTQ3NGQxZGEwXkEyXkFqcGdeQXVyMzMwOTU5MDk@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMDdmMTBiNTYtMDIzNi00NGVlLWIzMDYtZTk3MTQ3NGQxZGEwXkEyXkFqcGdeQXVyMzMwOTU5MDk@._V1_SX1000.jpg" },
    { id:26, top10:false, newSeason:false, title:"Gladiator",               year:2000, rating:"8.5", match:94, age:"16+", duration:"2h 35m", genre:["Action","Drama","History"],    desc:"A former Roman General seeks revenge against the corrupt emperor who murdered his family and enslaved him.", img:"https://m.media-amazon.com/images/M/MV5BMDliMmNhNDEtODUyOS00MjNlLTgxODEtN2U3NzIxMGVkZTA1L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMDliMmNhNDEtODUyOS00MjNlLTgxODEtN2U3NzIxMGVkZTA1L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX1000.jpg" },
    { id:27, top10:false, newSeason:false, title:"Spider-Man: No Way Home", year:2021, rating:"8.3", match:97, age:"13+", duration:"2h 28m", genre:["Action","Sci-Fi","Adventure"], desc:"Peter Parker asks Doctor Strange to help the world forget he is Spider-Man — with universe-shattering consequences.", img:"https://m.media-amazon.com/images/M/MV5BZWMyYzFjYTYtNTRjYi00OGExLWE2YzgtOGRmYjAxZTU3NzAyXkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BZWMyYzFjYTYtNTRjYi00OGExLWE2YzgtOGRmYjAxZTU3NzAyXkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_SX1000.jpg" },
    { id:28, top10:false, newSeason:false, title:"The Matrix",              year:1999, rating:"8.7", match:98, age:"16+", duration:"2h 16m", genre:["Sci-Fi","Action"],             desc:"A computer hacker learns the true nature of his simulated reality and joins a rebellion against machine controllers.", img:"https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVlLTM5YTItZjVhMWM1OGFhMzZhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVlLTM5YTItZjVhMWM1OGFhMzZhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX1000.jpg" },
  ],
  comedy: [
    { id:29, top10:false, newSeason:false, title:"The Grand Budapest Hotel",year:2014, rating:"8.1", match:95, age:"16+", duration:"1h 39m", genre:["Comedy","Drama","Adventure"],  desc:"A famous hotel concierge and his lobby boy become embroiled in the theft of a painting and a murder investigation.", img:"https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_SX1000.jpg" },
    { id:30, top10:false, newSeason:false, title:"Knives Out",              year:2019, rating:"7.9", match:93, age:"PG",  duration:"2h 10m", genre:["Comedy","Mystery","Drama"],    desc:"A detective investigates the death of a patriarch of an eccentric family, unravelling a web of deceptions.", img:"https://m.media-amazon.com/images/M/MV5BMGUwZjliMTAtNzAxZi00MWNiLWE2NzgtZGUxMGEwZjA0MWZiXkEyXkFqcGdeQXVyNjU1NzU3MzE@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMGUwZjliMTAtNzAxZi00MWNiLWE2NzgtZGUxMGEwZjA0MWZiXkEyXkFqcGdeQXVyNjU1NzU3MzE@._V1_SX1000.jpg" },
    { id:31, top10:false, newSeason:true,  title:"Barbie",                  year:2023, rating:"7.0", match:87, age:"PG",  duration:"1h 54m", genre:["Comedy","Fantasy","Adventure"], desc:"Barbie and Ken leave Barbieland for the real world on a journey of self-discovery that changes everything.", img:"https://m.media-amazon.com/images/M/MV5BNjU3N2QxNzYtMjk1NC00MTc4LTk1NTQtMmUxNTljM2I0NDA5XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNjU3N2QxNzYtMjk1NC00MTc4LTk1NTQtMmUxNTljM2I0NDA5XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX1000.jpg" },
    { id:32, top10:false, newSeason:false, title:"Glass Onion",             year:2022, rating:"7.2", match:88, age:"13+", duration:"2h 19m", genre:["Comedy","Mystery","Thriller"],  desc:"Tech billionaire Miles Bron invites his inner circle to a private island with detective Blanc.", img:"https://m.media-amazon.com/images/M/MV5BMTQzMDc0MTc0NF5BMl5BanBnXkFtZTgwNTg0NzExOA@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMTQzMDc0MTc0NF5BMl5BanBnXkFtZTgwNTg0NzExOA@@._V1_SX1000.jpg" },
    { id:33, top10:false, newSeason:false, title:"The Truman Show",         year:1998, rating:"8.2", match:96, age:"PG",  duration:"1h 43m", genre:["Comedy","Drama"],              desc:"An insurance salesman discovers his whole life is actually a reality TV show.", img:"https://m.media-amazon.com/images/M/MV5BMDIzODcyY2EtMmY2MC00ZWVlLTgwMzAtMjQwOWUyNmJiYWUwXkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMDIzODcyY2EtMmY2MC00ZWVlLTgwMzAtMjQwOWUyNmJiYWUwXkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_SX1000.jpg" },
    { id:34, top10:false, newSeason:false, title:"Superbad",                year:2007, rating:"7.6", match:88, age:"18+", duration:"1h 53m", genre:["Comedy"],                      desc:"Two inseparable best friends try to make their last high-school party legendary — things go hilariously wrong.", img:"https://m.media-amazon.com/images/M/MV5BMTc0NjIyMjA2OF5BMl5BanBnXkFtZTcwMDM5NjQzMw@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMTc0NjIyMjA2OF5BMl5BanBnXkFtZTcwMDM5NjQzMw@@._V1_SX1000.jpg" },
    { id:35, top10:false, newSeason:false, title:"About Time",              year:2013, rating:"7.8", match:92, age:"13+", duration:"2h 3m",  genre:["Romance","Comedy","Sci-Fi"],   desc:"At 21, Tim discovers he can travel in time and uses this gift to find love and improve his life.", img:"https://m.media-amazon.com/images/M/MV5BMjA5NTYzMDkyMF5BMl5BanBnXkFtZTcwNTc5MDM0OQ@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMjA5NTYzMDkyMF5BMl5BanBnXkFtZTcwNTc5MDM0OQ@@._V1_SX1000.jpg" },
    { id:36, top10:false, newSeason:false, title:"The Nice Guys",           year:2016, rating:"7.9", match:93, age:"18+", duration:"1h 56m", genre:["Comedy","Action","Crime"],     desc:"In 1970s L.A., a mismatched pair of private eyes investigate the apparent suicide of a fading film actress.", img:"https://m.media-amazon.com/images/M/MV5BOTkyMjE4NTY3OF5BMl5BanBnXkFtZTgwMzc4ODk4NzE@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BOTkyMjE4NTY3OF5BMl5BanBnXkFtZTgwMzc4ODk4NzE@._V1_SX1000.jpg" },
  ],
  horror: [
    { id:37, top10:false, newSeason:false, title:"Hereditary",              year:2018, rating:"7.3", match:89, age:"18+", duration:"2h 7m",  genre:["Horror","Drama","Mystery"],    desc:"After the family matriarch passes away, a grieving family is haunted by increasingly disturbing occurrences.", img:"https://m.media-amazon.com/images/M/MV5BOTU5MDg3OGItZWQ1Ny00ZGVmLTg2YTMtMDI4NmBmOWJmMTJlXkEyXkFqcGdeQXVyMzY0MTE3NzU@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BOTU5MDg3OGItZWQ1Ny00ZGVmLTg2YTMtMDI4NmBmOWJmMTJlXkEyXkFqcGdeQXVyMzY0MTE3NzU@._V1_SX1000.jpg" },
    { id:38, top10:false, newSeason:false, title:"Get Out",                 year:2017, rating:"7.7", match:92, age:"18+", duration:"1h 44m", genre:["Horror","Thriller","Mystery"],  desc:"A Black man visits his white girlfriend's family for the weekend, where a horrifying truth is revealed.", img:"https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyMl5BMl5BanBnXkFtZTgwNzcwMzc1MTI@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyMl5BMl5BanBnXkFtZTgwNzcwMzc1MTI@._V1_SX1000.jpg" },
    { id:39, top10:false, newSeason:false, title:"The Shining",             year:1980, rating:"8.4", match:94, age:"18+", duration:"2h 26m", genre:["Horror","Drama","Thriller"],   desc:"A family heads to an isolated hotel for the winter where a sinister presence drives the father into a murderous rage.", img:"https://m.media-amazon.com/images/M/MV5BZWFlYmY2MGItZjVkYy00YzU1LTg0YzItYWM1OTFmZjdjZDc1XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BZWFlYmY2MGItZjVkYy00YzU1LTg0YzItYWM1OTFmZjdjZDc1XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX1000.jpg" },
    { id:40, top10:false, newSeason:false, title:"A Quiet Place",           year:2018, rating:"7.5", match:91, age:"13+", duration:"1h 30m", genre:["Horror","Sci-Fi","Drama"],     desc:"A family struggles to survive in a post-apocalyptic world inhabited by blind monsters with an acute sense of hearing.", img:"https://m.media-amazon.com/images/M/MV5BMjI0MDMzNTQ0M15BMl5BanBnXkFtZTgwMTM5NzM3NDM@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMjI0MDMzNTQ0M15BMl5BanBnXkFtZTgwMTM5NzM3NDM@._V1_SX1000.jpg" },
    { id:41, top10:false, newSeason:false, title:"Midsommar",               year:2019, rating:"7.1", match:86, age:"18+", duration:"2h 27m", genre:["Horror","Mystery","Drama"],    desc:"A couple travels to Sweden for a midsummer festival — what begins idyllic quickly devolves into terror.", img:"https://m.media-amazon.com/images/M/MV5BMzQxNzQzOTQwM15BMl5BanBnXkFtZTgwMDQ0NTcwOA@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMzQxNzQzOTQwM15BMl5BanBnXkFtZTgwMDQ0NTcwOA@@._V1_SX1000.jpg" },
    { id:42, top10:false, newSeason:false, title:"Talk to Me",              year:2023, rating:"7.2", match:88, age:"18+", duration:"1h 35m", genre:["Horror","Thriller"],           desc:"When friends discover how to conjure spirits using an embalmed hand, they open a doorway to the spirit world.", img:"https://m.media-amazon.com/images/M/MV5BZjMzZjdjMWYtODNmYy00MzhhLWE4NjMtZmNhODFjNTdlZDJiXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BZjMzZjdjMWYtODNmYy00MzhhLWE4NjMtZmNhODFjNTdlZDJiXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_SX1000.jpg" },
    { id:43, top10:false, newSeason:false, title:"The Black Phone",         year:2021, rating:"7.4", match:90, age:"18+", duration:"1h 42m", genre:["Horror","Thriller","Drama"],   desc:"A kidnapped boy starts receiving calls on a disconnected phone from the serial killer's previous victims.", img:"https://m.media-amazon.com/images/M/MV5BOWQ1NTg2NDMtMzNiNS00ZGZlLTgwYzYtNGIyZjE4NjZlNzViXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BOWQ1NTg2NDMtMzNiNS00ZGZlLTgwYzYtNGIyZjE4NjZlNzViXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX1000.jpg" },
    { id:44, top10:false, newSeason:false, title:"Barbarian",               year:2022, rating:"7.1", match:86, age:"18+", duration:"1h 42m", genre:["Horror","Mystery","Thriller"],  desc:"A woman discovers there's more to fear than just an unexpected houseguest at her Detroit vacation rental.", img:"https://m.media-amazon.com/images/M/MV5BYWQ2NzQ3NzYtMzU4Yy00ZjQyLWJhZWYtZWZhNWZlZTRjZDFlXkEyXkFqcGdeQXVyMTAyMjQ3NzQ1._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BYWQ2NzQ3NzYtMzU4Yy00ZjQyLWJhZWYtZWZhNWZlZTRjZDFlXkEyXkFqcGdeQXVyMTAyMjQ3NzQ1._V1_SX1000.jpg" },
  ],
  romance: [
    { id:45, top10:false, newSeason:false, title:"La La Land",              year:2016, rating:"8.0", match:94, age:"PG",  duration:"2h 8m",  genre:["Romance","Drama","Musical"],   desc:"A pianist and actress fall in love in Los Angeles while both striving to reconcile their dreams with reality.", img:"https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_SX1000.jpg" },
    { id:46, top10:false, newSeason:false, title:"Titanic",                 year:1997, rating:"7.9", match:92, age:"13+", duration:"3h 14m", genre:["Romance","Drama","Disaster"],  desc:"A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the ill-fated R.M.S. Titanic.", img:"https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NTY3MzY@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NTY3MzY@._V1_SX1000.jpg" },
    { id:47, top10:false, newSeason:false, title:"Eternal Sunshine",        year:2004, rating:"8.3", match:96, age:"16+", duration:"1h 48m", genre:["Romance","Sci-Fi","Drama"],    desc:"A couple undergoes a procedure to erase each other from their memories — but love proves impossible to forget.", img:"https://m.media-amazon.com/images/M/MV5BMTY4NzcwODg3Nl5BMl5BanBnXkFtZTcwNTEwOTMyMw@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMTY4NzcwODg3Nl5BMl5BanBnXkFtZTcwNTEwOTMyMw@@._V1_SX1000.jpg" },
    { id:48, top10:false, newSeason:false, title:"Pride & Prejudice",       year:2005, rating:"7.8", match:91, age:"PG",  duration:"2h 9m",  genre:["Romance","Drama"],             desc:"Sparks fly when spirited Elizabeth Bennet meets proud Mr. Darcy, but their first impressions are far from favourable.", img:"https://m.media-amazon.com/images/M/MV5BNJQ4MzMzMzQzNl5BMl5BanBnXkFtZTcwNjI3MTMzMQ@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNJQ4MzMzMzQzNl5BMl5BanBnXkFtZTcwNjI3MTMzMQ@@._V1_SX1000.jpg" },
    { id:49, top10:false, newSeason:false, title:"Her",                     year:2013, rating:"8.0", match:94, age:"16+", duration:"2h 6m",  genre:["Romance","Drama","Sci-Fi"],    desc:"In a near future, a lonely writer develops an unlikely relationship with an AI operating system.", img:"https://m.media-amazon.com/images/M/MV5BMjA1Nzk0OTM2OF5BMl5BanBnXkFtZTgwNjU2NjEwMDE@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMjA1Nzk0OTM2OF5BMl5BanBnXkFtZTgwNjU2NjEwMDE@._V1_SX1000.jpg" },
    { id:50, top10:false, newSeason:false, title:"500 Days of Summer",      year:2009, rating:"7.8", match:91, age:"PG",  duration:"1h 35m", genre:["Romance","Comedy","Drama"],    desc:"An offbeat romantic comedy about a woman who doesn't believe true love exists, and the man who falls for her.", img:"https://m.media-amazon.com/images/M/MV5BMTk5MjgwNzQ1N15BMl5BanBnXkFtZTcwMDkzODMwMg@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMTk5MjgwNzQ1N15BMl5BanBnXkFtZTcwMDkzODMwMg@@._V1_SX1000.jpg" },
    { id:51, top10:false, newSeason:false, title:"Call Me by Your Name",    year:2017, rating:"7.9", match:93, age:"18+", duration:"2h 12m", genre:["Romance","Drama"],             desc:"In 1983 Italy, romance blossoms between a 17-year-old and the doctoral student staying with his family.", img:"https://m.media-amazon.com/images/M/MV5BNTk4OTQ4MDM2NF5BMl5BanBnXkFtZTgwMjI1NjU3NDM@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNTk4OTQ4MDM2NF5BMl5BanBnXkFtZTgwMjI1NjU3NDM@._V1_SX1000.jpg" },
    { id:52, top10:false, newSeason:false, title:"The Notebook",            year:2004, rating:"7.8", match:90, age:"PG",  duration:"2h 3m",  genre:["Romance","Drama"],             desc:"A poor yet passionate young man falls in love with a rich girl, giving her a sense of freedom she has never known.", img:"https://m.media-amazon.com/images/M/MV5BMTk3OTM5Njg5M15BMl5BanBnXkFtZTYwMzA0ODI3._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMTk3OTM5Njg5M15BMl5BanBnXkFtZTYwMzA0ODI3._V1_SX1000.jpg" },
  ],
  scifi: [
    { id:53, top10:false, newSeason:false, title:"Dune",                    year:2021, rating:"8.0", match:96, age:"13+", duration:"2h 35m", genre:["Sci-Fi","Adventure","Drama"],  desc:"Paul Atreides travels to Arrakis to secure his family's noble house and the most precious resource.", img:"https://m.media-amazon.com/images/M/MV5BN2FjNmEyNWMtYzM0ZS00NjIyLTg5YzYtYThlMGVjNzE1OGViXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BN2FjNmEyNWMtYzM0ZS00NjIyLTg5YzYtYThlMGVjNzE1OGViXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX1000.jpg" },
    { id:54, top10:false, newSeason:false, title:"Arrival",                 year:2016, rating:"7.9", match:94, age:"PG",  duration:"1h 56m", genre:["Sci-Fi","Drama","Mystery"],    desc:"A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear.", img:"https://m.media-amazon.com/images/M/MV5BMTExMzU0ODcxNDheQTJeQWpwZ15BbWU4MDE1OTI4MzAy._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMTExMzU0ODcxNDheQTJeQWpwZ15BbWU4MDE1OTI4MzAy._V1_SX1000.jpg" },
    { id:55, top10:false, newSeason:false, title:"The Martian",             year:2015, rating:"8.0", match:95, age:"PG",  duration:"2h 24m", genre:["Sci-Fi","Adventure","Drama"],  desc:"Astronaut Mark Watney is stranded alone on Mars and must use ingenuity to signal Earth and survive until rescue.", img:"https://m.media-amazon.com/images/M/MV5BMTc2MTQ3MDA1Nl5BMl5BanBnXkFtZTgwODA3OTM4NTE@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMTc2MTQ3MDA1Nl5BMl5BanBnXkFtZTgwODA3OTM4NTE@._V1_SX1000.jpg" },
    { id:56, top10:false, newSeason:false, title:"Gravity",                 year:2013, rating:"7.7", match:91, age:"PG",  duration:"1h 31m", genre:["Sci-Fi","Drama","Thriller"],   desc:"Two astronauts must work together to survive after an accident leaves them completely stranded in outer space.", img:"https://m.media-amazon.com/images/M/MV5BNjE5MzYwMzYxMF5BMl5BanBnXkFtZTcwOTk4MTk0OQ@@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNjE5MzYwMzYxMF5BMl5BanBnXkFtZTcwOTk4MTk0OQ@@._V1_SX1000.jpg" },
    { id:57, top10:false, newSeason:false, title:"Ex Machina",              year:2014, rating:"7.7", match:92, age:"18+", duration:"1h 48m", genre:["Sci-Fi","Drama","Thriller"],   desc:"A young programmer participates in a ground-breaking experiment testing an eerily lifelike artificial intelligence.", img:"https://m.media-amazon.com/images/M/MV5BMTUxNzc0OTIxMV5BMl5BanBnXkFtZTgwNDI3NzU2NDE@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMTUxNzc0OTIxMV5BMl5BanBnXkFtZTgwNDI3NzU2NDE@._V1_SX1000.jpg" },
    { id:58, top10:false, newSeason:false, title:"2001: A Space Odyssey",   year:1968, rating:"8.3", match:93, age:"PG",  duration:"2h 29m", genre:["Sci-Fi","Adventure","Mystery"], desc:"After uncovering a mysterious artifact on the Moon, a team travels to Jupiter accompanied by the rogue AI HAL 9000.", img:"https://m.media-amazon.com/images/M/MV5BMmNlYzRiNDctZWNhMi00MzI4LThkZTctMTUzMmZkMmFmNThmXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BMmNlYzRiNDctZWNhMi00MzI4LThkZTctMTUzMmZkMmFmNThmXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX1000.jpg" },
    { id:59, top10:false, newSeason:false, title:"Blade Runner 2049",       year:2017, rating:"8.0", match:94, age:"18+", duration:"2h 44m", genre:["Sci-Fi","Drama","Thriller"],   desc:"Young Blade Runner K discovers a long-buried secret that leads him to find Rick Deckard, missing for thirty years.", img:"https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_SX1000.jpg" },
    { id:60, top10:false, newSeason:false, title:"Moon",                    year:2009, rating:"7.9", match:93, age:"16+", duration:"1h 37m", genre:["Sci-Fi","Drama","Mystery"],    desc:"Astronaut Sam Bell nears the end of a solo lunar mission and has a strange encounter that shatters his reality.", img:"https://m.media-amazon.com/images/M/MV5BODA2MjYyN2EtNjUwOS00NDk2LWI0ZGItNTAyM2M5OTZmODkzXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg", backdrop:"https://m.media-amazon.com/images/M/MV5BODA2MjYyN2EtNjUwOS00NDk2LWI0ZGItNTAyM2M5OTZmODkzXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX1000.jpg" },
  ],
};

const HERO_MOVIE = MOVIES.trending[0];
const ROWS = [
  { id:"trending", label:"🔥 Trending Now",         movies: MOVIES.trending },
  { id:"topRated", label:"⭐ Top Rated on Netflex",  movies: MOVIES.topRated },
  { id:"action",   label:"💥 Action & Adventure",    movies: MOVIES.action   },
  { id:"comedy",   label:"😂 Comedy",                movies: MOVIES.comedy   },
  { id:"horror",   label:"👻 Horror",                movies: MOVIES.horror   },
  { id:"romance",  label:"❤️  Romance",             movies: MOVIES.romance  },
  { id:"scifi",    label:"🚀 Sci-Fi",                movies: MOVIES.scifi    },
];
const NAV_ITEMS = [
  { label:"Home",          section:null            },
  { label:"TV Shows",      section:"trending"      },
  { label:"Movies",        section:"topRated"      },
  { label:"New & Popular", section:"action"        },
  { label:"My List",       section:"__mylist__"    },
];

/* ============================================================
   ICONS
   ============================================================ */
const Ico = {
  Play:   ({s=16,c="#000"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><polygon points="5,3 19,12 5,21"/></svg>,
  Info:   ({s=16})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="3"/></svg>,
  Plus:   ({s=14})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check:  ({s=14})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Like:   ({s=14})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
  Down:   ({s=14})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6,9 12,15 18,9"/></svg>,
  Vol:    ({s=18})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>,
  Close:  ({s=17})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ChevL:  ()                => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>,
  ChevR:  ()                => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6"/></svg>,
  Search: ()                => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell:   ()                => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  User:   ({s=16,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Edit:   ({s=16})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Shield: ({s=16})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  CreditCard: ({s=16})      => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Monitor: ({s=16})         => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Users:  ({s=16})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Home2:  ({s=16})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  LogOut: ({s=16})          => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  ChevRight: ({s=16,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><polyline points="9,18 15,12 9,6"/></svg>,
};

/* ============================================================
   LOGO
   ============================================================ */
function NetflexLogo({ size=36, dark=false }) {
  return (
    <span style={{
      fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:size, letterSpacing:3,
      background:"linear-gradient(135deg,#ff1a1a 0%,#e50914 50%,#9b0a10 100%)",
      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
      filter:"drop-shadow(0 2px 12px rgba(229,9,20,0.55))",
      lineHeight:1, cursor:"pointer", userSelect:"none", flexShrink:0,
    }}>NETFLEX</span>
  );
}

/* ============================================================
   PROFILE DROPDOWN
   ============================================================ */
function ProfileDropdown({ onAccount, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener("mousedown", fn), 0);
    return () => document.removeEventListener("mousedown", fn);
  }, [onClose]);

  const profiles = [
    { name:"Aarna", color:"#e50914", initial:"A" },
    { name:"Guest",  color:"#0071eb", initial:"G" },
  ];

  return (
    <div ref={ref} className="profile-menu">
      {/* Profiles */}
      <div style={{ padding:"10px 0 4px" }}>
        {profiles.map(p => (
          <div key={p.name} className="pmenu-item" style={{ gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:4, background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, fontFamily:"'Bebas Neue',sans-serif", flexShrink:0 }}>{p.initial}</div>
            <span>{p.name}</span>
          </div>
        ))}
        <div className="pmenu-item" style={{ color:"#aaa" }}>
          <Ico.Edit s={15} />
          <span>Manage Profiles</span>
        </div>
      </div>
      <div className="pmenu-divider" />
      <div className="pmenu-item" onClick={() => { onAccount(); onClose(); }}>
        <Ico.User s={15} />
        <span>Account</span>
      </div>
      <div className="pmenu-item">
        <Ico.Shield s={15} />
        <span>Settings</span>
      </div>
      <div className="pmenu-divider" />
      <div className="pmenu-item" style={{ color:"#e5e5e5", justifyContent:"center", fontWeight:600, fontSize:12, letterSpacing:0.5 }}>
        Sign out of Netflex
      </div>
    </div>
  );
}

/* ============================================================
   ACCOUNT PAGE  (matches Image 1 exactly)
   ============================================================ */
function AccountPage({ onBack }) {
  const [activeSection, setActiveAcc] = useState("overview");

  const sidebarItems = [
    { id:"overview",    label:"Overview",   icon:<Ico.Home2 s={18} />     },
    { id:"membership",  label:"Membership", icon:<Ico.CreditCard s={18}/> },
    { id:"security",    label:"Security",   icon:<Ico.Shield s={18} />    },
    { id:"devices",     label:"Devices",    icon:<Ico.Monitor s={18} />   },
    { id:"profiles",    label:"Profiles",   icon:<Ico.Users s={18} />     },
  ];

  const quickLinks = [
    { label:"Change plan",              icon:<Ico.Monitor s={18}/> },
    { label:"Manage payment method",    icon:<Ico.CreditCard s={18}/> },
    { label:"Manage access and devices",icon:<Ico.Monitor s={18}/> },
    { label:"Update password",          icon:<Ico.Shield s={18}/> },
    { label:"Sign out of all devices",  icon:<Ico.LogOut s={18}/> },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f3f3f3", fontFamily:"'Montserrat','Helvetica Neue',Arial,sans-serif" }}>
      {/* Account Navbar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e0e0e0", padding:"0 4%", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <NetflexLogo size={28} />
        <div style={{ width:36, height:36, borderRadius:4, background:"#e50914", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:16, fontFamily:"'Bebas Neue',sans-serif", color:"#fff", cursor:"pointer" }}>A</div>
      </div>

      <div style={{ display:"flex", maxWidth:1100, margin:"0 auto", padding:"32px 24px", gap:40, flexWrap:"wrap" }}>
        {/* SIDEBAR */}
        <div style={{ flex:"0 0 220px" }}>
          <div
            onClick={onBack}
            style={{ display:"flex", alignItems:"center", gap:8, color:"#333", fontSize:14, cursor:"pointer", marginBottom:24, fontWeight:500 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
            Back to Netflex
          </div>
          <nav style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {sidebarItems.map(item => (
              <div
                key={item.id}
                className={`acc-sidebar-item${activeSection===item.id?" active":""}`}
                onClick={() => setActiveAcc(item.id)}
                style={{ color: activeSection===item.id ? "#000" : "#555" }}
              >
                <span style={{ color:"#555" }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ fontSize:32, fontWeight:800, color:"#000", marginBottom:4 }}>Account</h1>
          <p style={{ color:"#555", fontSize:14, marginBottom:24 }}>Membership details</p>

          {/* Membership Card */}
          <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e0e0e0", marginBottom:24, overflow:"hidden" }}>
            {/* Purple badge */}
            <div style={{ background:"linear-gradient(135deg,#6a11cb,#4a1a8c)", padding:"8px 20px", display:"inline-block", borderRadius:"0 0 20px 0" }}>
              <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>Member since June 2024</span>
            </div>
            <div style={{ padding:"18px 22px" }}>
              <p style={{ fontSize:17, fontWeight:700, color:"#000", marginBottom:6 }}>Basic plan</p>
              <p style={{ fontSize:14, color:"#555", marginBottom:6 }}>Next payment: 26 March 2026</p>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, background:"#f0f0f0", padding:"2px 6px", borderRadius:3, fontWeight:600, color:"#333" }}>G Pay</span>
                <span style={{ fontSize:14, color:"#333" }}>c•••@okhdfcbank</span>
              </div>
            </div>
            <div className="acc-row" style={{ borderTop:"1px solid #e5e5e5" }}>
              <span style={{ fontSize:15, fontWeight:700, color:"#000" }}>Manage membership</span>
              <Ico.ChevRight s={18} c="#333" />
            </div>
          </div>

          {/* Quick Links */}
          <p style={{ fontSize:14, color:"#555", marginBottom:10, fontWeight:600 }}>Quick links</p>
          <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e0e0e0", overflow:"hidden" }}>
            {quickLinks.map((link, i) => (
              <div key={i} className="acc-row">
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <span style={{ color:"#555" }}>{link.icon}</span>
                  <span style={{ fontSize:15, fontWeight:600, color:"#111" }}>{link.label}</span>
                </div>
                <Ico.ChevRight s={18} c="#333" />
              </div>
            ))}
          </div>

          {/* Security section */}
          {activeSection === "security" && (
            <div style={{ marginTop:24, background:"#fff", borderRadius:8, border:"1px solid #e0e0e0", overflow:"hidden" }}>
              <div style={{ padding:"18px 22px", borderBottom:"1px solid #e5e5e5" }}>
                <p style={{ fontSize:16, fontWeight:700, color:"#000", marginBottom:4 }}>Security</p>
                <p style={{ fontSize:13, color:"#777" }}>Manage your password and account access</p>
              </div>
              {["Update password","Two-factor authentication","Recent device logins"].map((item,i) => (
                <div key={i} className="acc-row">
                  <span style={{ fontSize:14, fontWeight:600, color:"#111" }}>{item}</span>
                  <Ico.ChevRight s={18} c="#333" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   NAVBAR
   ============================================================ */
function Navbar({ onSearch, searchQuery, activeSection, onNavClick, onOpenAccount }) {
  const [scrolled, setScrolled]       = useState(false);
  const [showSearch, setShowSearch]   = useState(false);
  const [mobileOpen, setMobile]       = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const inputRef  = useRef(null);
  const profileRef= useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { if (showSearch) inputRef.current?.focus(); }, [showSearch]);

  return (
    <>
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:600, height:68, padding:"0 4%",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background: scrolled ? "rgba(20,20,20,0.97)" : "linear-gradient(180deg,rgba(0,0,0,0.85)0%,transparent 100%)",
        transition:"background 0.5s ease",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "none",
      }}>
        {/* LEFT */}
        <div style={{ display:"flex", alignItems:"center", gap:28 }}>
          <NetflexLogo size={36} />
          <div className="desktop-nav" style={{ display:"flex", gap:20 }}>
            {NAV_ITEMS.map(item => (
              <span key={item.label}
                className={`nav-link${activeSection===item.section?" active":""}`}
                onClick={() => onNavClick(item.section)}
              >{item.label}</span>
            ))}
          </div>
          <button className="hamburger" onClick={() => setMobile(v => !v)}
            style={{ display:"none", background:"none", border:"none", color:"#fff", fontSize:22, cursor:"pointer", alignItems:"center" }}>☰</button>
        </div>

        {/* RIGHT */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={() => setShowSearch(v => !v)}
              style={{ background:"none", border:"none", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", padding:4 }}>
              <Ico.Search />
            </button>
            {showSearch && (
              <input ref={inputRef} className="search-input" value={searchQuery}
                onChange={e => onSearch(e.target.value)} placeholder="Titles, genres, years…" />
            )}
          </div>
          <button style={{ background:"none", border:"none", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center" }}>
            <Ico.Bell />
          </button>

          {/* PROFILE BUTTON */}
          <div ref={profileRef} style={{ position:"relative" }}>
            <div
              onClick={() => setShowProfile(v => !v)}
              style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", padding:"4px 0" }}
            >
              <div style={{ width:32, height:32, borderRadius:4, background:"#e50914", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, transition:"opacity 0.15s" }}>A</div>
              <div style={{ transition:"transform 0.2s", transform: showProfile ? "rotate(180deg)" : "rotate(0deg)" }}>
                <Ico.Down s={12} />
              </div>
            </div>
            {showProfile && (
              <ProfileDropdown onAccount={onOpenAccount} onClose={() => setShowProfile(false)} />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position:"fixed", top:68, left:0, right:0, zIndex:599, background:"rgba(14,14,14,0.98)", padding:"18px 5%", display:"flex", flexDirection:"column", gap:18, borderBottom:"1px solid #222" }}>
          {NAV_ITEMS.map(item => (
            <span key={item.label} className="nav-link" style={{ fontSize:15 }}
              onClick={() => { onNavClick(item.section); setMobile(false); }}
            >{item.label}</span>
          ))}
          <div className="pmenu-divider" />
          <span className="nav-link" onClick={() => { onOpenAccount(); setMobile(false); }}>Account</span>
        </div>
      )}
    </>
  );
}

/* ============================================================
   HERO
   ============================================================ */
function Hero({ movie, onInfo }) {
  return (
    <div style={{ position:"relative", width:"100%", height:"clamp(500px,85vh,820px)", overflow:"hidden" }}>
      <img src={movie.backdrop} alt={movie.title}
        style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center" }}
        onError={e => { e.target.src = movie.img; }} />
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,rgba(20,20,20,0.93)0%,rgba(20,20,20,0.45)52%,transparent 100%)" }} />
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,#141414 0%,rgba(20,20,20,0.08)42%,transparent 100%)" }} />
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,0.3)0%,transparent 18%)" }} />

      <div className="hero-content" style={{ position:"absolute", bottom:"20%", left:"4%", maxWidth:540 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", color:"#e50914", fontSize:14, letterSpacing:3 }}>N</span>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:3, color:"#ccc", textTransform:"uppercase" }}>Feature Film</span>
        </div>
        <h1 style={{ fontSize:"clamp(32px,5.5vw,78px)", fontWeight:900, lineHeight:1.02, marginBottom:16, letterSpacing:"-0.5px", textShadow:"2px 4px 28px rgba(0,0,0,0.85)" }}>
          {movie.title}
        </h1>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, flexWrap:"wrap" }}>
          <span style={{ color:"#46d369", fontWeight:700, fontSize:14 }}>{movie.match}% Match</span>
          <span className="maturity">{movie.age}</span>
          <span style={{ color:"#ccc", fontSize:13 }}>{movie.duration}</span>
          {movie.genre.slice(0,3).map(g => (
            <span key={g} style={{ fontSize:11, border:"1px solid rgba(255,255,255,0.28)", borderRadius:3, padding:"1px 7px", color:"#ddd" }}>{g}</span>
          ))}
        </div>
        <p style={{ fontSize:"clamp(13px,1.4vw,15px)", lineHeight:1.72, color:"rgba(255,255,255,0.9)", marginBottom:26, textShadow:"1px 2px 10px rgba(0,0,0,0.75)" }}>
          {movie.desc}
        </p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button className="btn-play"><Ico.Play s={18} c="#000" /> Play</button>
          <button className="btn-info" onClick={() => onInfo(movie)}><Ico.Info s={18} /> More Info</button>
        </div>
      </div>

      <button style={{ position:"absolute", bottom:"22%", right:"4%", width:40, height:40, borderRadius:"50%", background:"rgba(0,0,0,0.45)", border:"2px solid rgba(255,255,255,0.55)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Ico.Vol s={17} />
      </button>
    </div>
  );
}

/* ============================================================
   MOVIE CARD  —  Netflix-style hover expand panel
   ============================================================ */
function MovieCard({ movie, onClick, inMyList, onToggleList }) {
  const [err, setErr] = useState(false);

  return (
    <div className="card-wrap" onClick={() => onClick(movie)}>
      <div className="card-inner">
        {/* Badges */}
        {movie.top10 && <div className="top10-badge">TOP 10</div>}

        {err
          ? <div className="card-img shimmer" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:9, color:"#555", padding:"0 8px", textAlign:"center" }}>{movie.title}</span>
            </div>
          : <img className="card-img" src={movie.img} alt={movie.title} loading="lazy" onError={() => setErr(true)} />
        }

        {movie.newSeason && <div className="new-badge">New Season</div>}

        {/* Static title bar */}
        <div style={{ padding:"7px 10px 9px", background:"#1c1c1c" }}>
          <p style={{ fontSize:11, fontWeight:600, color:"#e5e5e5", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:2 }}>{movie.title}</p>
          <p style={{ fontSize:10, color:"#777" }}>{movie.year}</p>
        </div>
      </div>

      {/* ── Hover expand panel (like Netflix) ── */}
      <div className="card-expand" onClick={e => e.stopPropagation()}>
        {/* Action buttons row */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
          <button className="ic-btn play" onClick={() => onClick(movie)}><Ico.Play s={13} c="#000" /></button>
          <button className="ic-btn ghost" style={{ color:"#fff" }} onClick={() => onToggleList(movie)}>
            {inMyList ? <Ico.Check s={13} /> : <Ico.Plus s={13} />}
          </button>
          <button className="ic-btn ghost" style={{ color:"#fff" }}><Ico.Like s={13} /></button>
          <button className="ic-btn ghost" style={{ marginLeft:"auto", color:"#fff" }} onClick={() => onClick(movie)}>
            <Ico.Down s={13} />
          </button>
        </div>
        {/* Match + age + duration */}
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, flexWrap:"wrap" }}>
          <span style={{ color:"#46d369", fontWeight:700, fontSize:11 }}>{movie.match}% Match</span>
          <span style={{ border:"1px solid #666", borderRadius:2, padding:"0 5px", fontSize:10, color:"#ccc" }}>{movie.age}</span>
          <span style={{ fontSize:10, color:"#aaa" }}>{movie.duration}</span>
          {movie.top10 && <span style={{ background:"#e50914", borderRadius:2, padding:"0 5px", fontSize:9, fontWeight:700, color:"#fff" }}>TOP 10</span>}
        </div>
        {/* Genres as dots */}
        <p style={{ fontSize:10, color:"#aaa", lineHeight:1.5 }}>
          {movie.genre.slice(0,3).map((g,i) => (
            <span key={g}>{i > 0 && <span style={{ margin:"0 4px", color:"#555" }}>•</span>}{g}</span>
          ))}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   CONTENT ROW
   ============================================================ */
function ContentRow({ rowId, label, movies, onCardClick, myList, onToggleList }) {
  const ref = useRef(null);
  const scroll = dir => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir==="l" ? -ref.current.offsetWidth*0.78 : ref.current.offsetWidth*0.78, behavior:"smooth" });
  };
  return (
    <section id={rowId} className="section-anchor" style={{ padding:"4px 4%", marginBottom:8 }}>
      <h2 style={{ fontSize:"clamp(13px,1.8vw,18px)", fontWeight:700, marginBottom:0, color:"#e5e5e5", letterSpacing:0.3, display:"flex", alignItems:"center", gap:10 }}>
        {label}
        <span style={{ fontSize:11, color:"#e50914", fontWeight:700, cursor:"pointer", opacity:0.85 }}>Explore All ›</span>
      </h2>
      <div className="row-outer" style={{ position:"relative" }}>
        <button className="scroll-btn" style={{ left:-4 }} onClick={() => scroll("l")}><Ico.ChevL /></button>
        <div className="row-track" ref={ref}>
          {movies.map(m => (
            <MovieCard key={m.id} movie={m} onClick={onCardClick}
              inMyList={myList.has(m.id)} onToggleList={onToggleList} />
          ))}
        </div>
        <button className="scroll-btn right" style={{ right:-4 }} onClick={() => scroll("r")}><Ico.ChevR /></button>
      </div>
    </section>
  );
}

/* ============================================================
   MODAL
   ============================================================ */
function Modal({ movie, onClose, myList, onToggleList }) {
  useEffect(() => {
    const fn = e => { if (e.key==="Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);

  const allMovies = Object.values(MOVIES).flat();
  const similar = allMovies.filter(m => m.id!==movie.id && m.genre.some(g => movie.genre.includes(g))).slice(0,6);

  return (
    <div className="modal-bg" onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ position:"relative", height:"min(420px,52vw)", minHeight:230, overflow:"hidden", borderRadius:"10px 10px 0 0" }}>
          <img src={movie.backdrop} alt={movie.title}
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}
            onError={e => { e.target.src = movie.img; }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,#181818 0%,rgba(24,24,24,0.15)55%,transparent 100%)" }} />
          <button className="modal-x" onClick={onClose}><Ico.Close s={17} /></button>
          <div style={{ position:"absolute", bottom:28, left:30, right:30 }}>
            <h2 style={{ fontSize:"clamp(22px,4vw,48px)", fontWeight:900, marginBottom:16, lineHeight:1.06, textShadow:"0 2px 16px rgba(0,0,0,0.9)" }}>{movie.title}</h2>
            <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              <button className="btn-play" style={{ padding:"9px 22px", fontSize:14 }}><Ico.Play s={14} c="#000" /> Play</button>
              <button className="ic-btn ghost" style={{ width:42, height:42, color:"#fff" }} onClick={() => onToggleList(movie)}>
                {myList.has(movie.id) ? <Ico.Check s={17} /> : <Ico.Plus s={17} />}
              </button>
              <button className="ic-btn ghost" style={{ width:42, height:42, color:"#fff" }}><Ico.Like s={16} /></button>
            </div>
          </div>
        </div>

        <div style={{ padding:"22px 30px 36px" }}>
          <div style={{ display:"flex", gap:28, flexWrap:"wrap" }}>
            <div style={{ flex:"1 1 260px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, flexWrap:"wrap" }}>
                <span style={{ color:"#46d369", fontWeight:700, fontSize:15 }}>{movie.match}% Match</span>
                <span style={{ color:"#ccc", fontSize:13 }}>{movie.year}</span>
                <span className="maturity" style={{ fontSize:12 }}>{movie.age}</span>
                <span style={{ color:"#ccc", fontSize:13 }}>{movie.duration}</span>
                <span style={{ border:"1px solid #555", borderRadius:2, padding:"1px 6px", fontSize:10, color:"#bbb" }}>HD</span>
              </div>
              <p style={{ fontSize:14, lineHeight:1.75, color:"#ccc" }}>{movie.desc}</p>
            </div>
            <div style={{ flex:"0 0 165px", fontSize:13 }}>
              <p style={{ marginBottom:8 }}><span style={{ color:"#777" }}>Genres: </span>{movie.genre.join(", ")}</p>
              <p style={{ marginBottom:8 }}><span style={{ color:"#777" }}>Rating: </span>⭐ {movie.rating}</p>
              <p><span style={{ color:"#777" }}>Year: </span>{movie.year}</p>
            </div>
          </div>

          {similar.length > 0 && <>
            <h3 style={{ fontSize:17, fontWeight:700, margin:"26px 0 14px", color:"#e5e5e5" }}>More Like This</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))", gap:10 }}>
              {similar.map(m => (
                <div key={m.id} style={{ borderRadius:5, overflow:"hidden", cursor:"pointer", background:"#222" }}>
                  <img src={m.img} alt={m.title} style={{ width:"100%", height:90, objectFit:"cover", display:"block" }} onError={e => { e.target.style.display="none"; }} />
                  <div style={{ padding:"7px 9px" }}>
                    <p style={{ fontSize:11, fontWeight:700, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.title}</p>
                    <p style={{ fontSize:10, color:"#46d369", fontWeight:700 }}>{m.match}% Match</p>
                  </div>
                </div>
              ))}
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MY LIST
   ============================================================ */
function MyListPage({ myList, allMovies, onCardClick, onToggleList }) {
  const movies = allMovies.filter(m => myList.has(m.id));
  return (
    <div style={{ padding:"100px 4% 60px" }}>
      <h1 style={{ fontSize:28, fontWeight:800, marginBottom:22, color:"#e5e5e5" }}>My List</h1>
      {movies.length===0
        ? <div style={{ textAlign:"center", color:"#555", paddingTop:90 }}>
            <p style={{ fontSize:20, marginBottom:10 }}>Your list is empty</p>
            <p style={{ fontSize:13 }}>Hover over any card and tap + to save it here.</p>
          </div>
        : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
            {movies.map(m => <MovieCard key={m.id} movie={m} onClick={onCardClick} inMyList={true} onToggleList={onToggleList} />)}
          </div>
      }
    </div>
  );
}

/* ============================================================
   SEARCH RESULTS
   ============================================================ */
function SearchResults({ query, onCardClick, myList, onToggleList }) {
  const all = Object.values(MOVIES).flat();
  const q   = query.toLowerCase();
  const results = all.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.genre.some(g => g.toLowerCase().includes(q)) ||
    String(m.year).includes(q)
  );
  return (
    <div style={{ padding:"100px 4% 60px" }}>
      <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20, color:"#e5e5e5" }}>
        {results.length ? `Results for "${query}"` : `No results for "${query}"`}
      </h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
        {results.map(m => <MovieCard key={m.id} movie={m} onClick={onCardClick} inMyList={myList.has(m.id)} onToggleList={onToggleList} />)}
      </div>
    </div>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  const links = ["FAQ","Help Centre","Account","Media Centre","Investor Relations","Jobs","Ways to Watch","Terms of Use","Privacy","Cookie Preferences","Corporate Information","Contact Us","Speed Test","Legal Notices","Only on Netflex"];
  return (
    <footer style={{ padding:"56px 4% 48px", borderTop:"1px solid #1e1e1e", marginTop:60 }}>
      <p style={{ color:"#737373", fontSize:14, marginBottom:26 }}>
        Questions? Call <a href="tel:000800919" style={{ color:"#737373", textDecoration:"underline" }}>000-800-919-1743</a>
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:"0 16px", marginBottom:32 }}>
        {links.map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
      </div>
      <select style={{ background:"transparent", border:"1px solid #555", color:"#737373", padding:"6px 10px", borderRadius:3, fontSize:13, cursor:"pointer", marginBottom:24 }}>
        <option>🌐 English</option><option>हिन्दी</option>
      </select>
      <p style={{ color:"#3a3a3a", fontSize:12, marginBottom:10 }}>© 2024 Netflex, Inc.</p>
      <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:3,
        background:"linear-gradient(90deg,#e50914,#ff4d4d,#e50914)",
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
        filter:"drop-shadow(0 1px 8px rgba(229,9,20,0.4))" }}>
        ✦ AARNA CHOPDEKAR CREATION ✦
      </p>
    </footer>
  );
}

/* ============================================================
   APP ROOT
   ============================================================ */
export default function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [myList, setMyList]               = useState(new Set());
  const [activeSection, setActiveSection] = useState(null);
  const [showMyList, setShowMyList]       = useState(false);
  const [showAccount, setShowAccount]     = useState(false);

  const allMovies = Object.values(MOVIES).flat();

  useEffect(() => {
    const id = "netflex-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id=id; s.textContent=GLOBAL_CSS;
      document.head.appendChild(s);
    }
    return () => { const el=document.getElementById(id); if(el) el.remove(); };
  }, []);

  const handleNavClick = useCallback(section => {
    setActiveSection(section); setSearchQuery("");
    if (section==="__mylist__") { setShowMyList(true); window.scrollTo({top:0,behavior:"smooth"}); return; }
    setShowMyList(false);
    if (!section) { window.scrollTo({top:0,behavior:"smooth"}); return; }
    document.getElementById(section)?.scrollIntoView({behavior:"smooth",block:"start"});
  }, []);

  const handleToggleList = useCallback(movie => {
    setMyList(prev => {
      const next = new Set(prev);
      next.has(movie.id) ? next.delete(movie.id) : next.add(movie.id);
      return next;
    });
  }, []);

  // Show account page
  if (showAccount) {
    return <AccountPage onBack={() => setShowAccount(false)} />;
  }

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div style={{ minHeight:"100vh", background:"#141414" }}>
      <Navbar
        onSearch={q => { setSearchQuery(q); setShowMyList(false); }}
        searchQuery={searchQuery}
        activeSection={activeSection}
        onNavClick={handleNavClick}
        onOpenAccount={() => setShowAccount(true)}
      />

      {isSearching ? (
        <SearchResults query={searchQuery.trim()} onCardClick={setSelectedMovie} myList={myList} onToggleList={handleToggleList} />
      ) : showMyList ? (
        <MyListPage myList={myList} allMovies={allMovies} onCardClick={setSelectedMovie} onToggleList={handleToggleList} />
      ) : (
        <>
          <Hero movie={HERO_MOVIE} onInfo={setSelectedMovie} />
          <div style={{ position:"relative", zIndex:1, marginTop:-90 }}>
            {ROWS.map(row => (
              <ContentRow key={row.id} rowId={row.id} label={row.label} movies={row.movies}
                onCardClick={setSelectedMovie} myList={myList} onToggleList={handleToggleList} />
            ))}
          </div>
        </>
      )}

      <Footer />

      {selectedMovie && (
        <Modal movie={selectedMovie} onClose={() => setSelectedMovie(null)} myList={myList} onToggleList={handleToggleList} />
      )}
    </div>
  );
}
