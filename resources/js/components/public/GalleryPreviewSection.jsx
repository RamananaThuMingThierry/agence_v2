import React from "react";
import SectionTitle from "./SectionTitle";

export default function GalleryPreviewSection({ items }) {
  return (
    <section id="gallery" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow="Galerie photos"
            title="Inspirez les voyageurs avec les plus beaux paysages"
            text="La galerie doit montrer des photos reelles : clients, guides, parcs, animaux, hotels, voitures et moments forts du voyage."
          />
          <a href="#page-gallery" className="rounded-full bg-emerald-700 px-6 py-3 font-bold text-white shadow transition hover:bg-emerald-800">Voir toute la galerie</a>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="group relative col-span-2 row-span-2 overflow-hidden rounded-3xl">
            <img src="https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=1000&q=80" alt="Allee des Baobabs" className="h-full min-h-[420px] w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-5 left-5 text-2xl font-extrabold text-white">Allee des Baobabs</p>
          </div>
          {items.map((item) => (
            <div key={item.title} className="group relative overflow-hidden rounded-3xl">
              <img src={item.image} alt={item.title} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-4 left-4 font-bold text-white">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
