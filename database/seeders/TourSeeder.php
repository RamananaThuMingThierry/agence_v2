<?php

namespace Database\Seeders;

use App\Models\Tour;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TourSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $tours = [
            [
                'title' => 'Decouverte des Hautes Terres',
                'description' => 'Un circuit culturel entre Antananarivo, Antsirabe et Ambositra pour decouvrir les paysages, les artisans et les villages des Hautes Terres.',
                'price' => 480000,
                'duration' => '4 jours / 3 nuits',
                'category' => 'Culture',
                'start_location' => 'Antananarivo',
                'end_location' => 'Ambositra',
                'status' => 'active',
                'images' => [
                    [
                        'image_url' => 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=1400&q=80',
                        'is_cover' => true,
                        'caption' => 'Paysage des Hautes Terres',
                    ],
                    [
                        'image_url' => 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=80',
                        'is_cover' => false,
                        'caption' => 'Route et villages traditionnels',
                    ],
                ],
                'programs' => [
                    [
                        'day_number' => 1,
                        'title' => 'Depart vers Antsirabe',
                        'description' => 'Depart depuis Antananarivo, arrets photos sur la RN7 et installation a Antsirabe.',
                        'activities' => 'Visite de la ville, pousse-pousse, marche artisanal.',
                    ],
                    [
                        'day_number' => 2,
                        'title' => 'Lacs volcaniques',
                        'description' => 'Excursion autour des lacs Tritriva et Andraikiba avec temps libre pour les photos.',
                        'activities' => 'Balade, rencontre locale, pique-nique.',
                    ],
                    [
                        'day_number' => 3,
                        'title' => 'Ambositra et artisanat',
                        'description' => 'Route vers Ambositra et decouverte des ateliers de sculpture sur bois.',
                        'activities' => 'Ateliers Zafimaniry, achats souvenirs, diner local.',
                    ],
                ],
                'inclusions' => [
                    'Transport prive pendant le circuit',
                    'Hebergement en chambre double',
                    'Guide accompagnateur francophone',
                    'Petits dejeuners',
                ],
                'exclusions' => [
                    'Vols internationaux',
                    'Repas non mentionnes',
                    'Assurance voyage',
                    'Depenses personnelles',
                ],
                'reviews' => [
                    [
                        'name' => 'Claire Martin',
                        'rating' => 5,
                        'review' => 'Circuit tres bien organise, avec un guide disponible et des paysages magnifiques.',
                        'status' => 'publish',
                    ],
                    [
                        'name' => 'Julien Bernard',
                        'rating' => 4,
                        'review' => 'Bon rythme pour decouvrir les Hautes Terres sans se presser.',
                        'status' => 'publish',
                    ],
                ],
            ],
            [
                'title' => 'Aventure a Andasibe',
                'description' => 'Une escapade nature dans la foret humide d\'Andasibe pour observer les lemuriens, les oiseaux et la biodiversite de Madagascar.',
                'price' => 620000,
                'duration' => '3 jours / 2 nuits',
                'category' => 'Nature',
                'start_location' => 'Antananarivo',
                'end_location' => 'Andasibe',
                'status' => 'active',
                'images' => [
                    [
                        'image_url' => 'https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?auto=format&fit=crop&w=1400&q=80',
                        'is_cover' => true,
                        'caption' => 'Foret tropicale',
                    ],
                    [
                        'image_url' => 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=1400&q=80',
                        'is_cover' => false,
                        'caption' => 'Observation de la faune',
                    ],
                ],
                'programs' => [
                    [
                        'day_number' => 1,
                        'title' => 'Route vers Andasibe',
                        'description' => 'Depart matinal, visite d\'une reserve privee et balade nocturne.',
                        'activities' => 'Route panoramique, reserve, sortie nocturne.',
                    ],
                    [
                        'day_number' => 2,
                        'title' => 'Parc national',
                        'description' => 'Journee dediee au parc national Analamazaotra et a l\'observation des indri-indri.',
                        'activities' => 'Randonnee guidee, observation des lemuriens, visite du village.',
                    ],
                ],
                'inclusions' => [
                    'Transport aller-retour',
                    'Entrees au parc',
                    'Guide local specialise',
                    'Hebergement',
                ],
                'exclusions' => [
                    'Dejeuners et diners',
                    'Boissons',
                    'Pourboires',
                ],
                'reviews' => [
                    [
                        'name' => 'Sophie Laurent',
                        'rating' => 5,
                        'review' => 'Les lemuriens etaient au rendez-vous et le guide connaissait tres bien le parc.',
                        'status' => 'publish',
                    ],
                ],
            ],
            [
                'title' => 'Sejour balneaire a Nosy Be',
                'description' => 'Un sejour detente a Nosy Be avec plages, excursion en bateau et coucher de soleil sur l\'ocean Indien.',
                'price' => 950000,
                'duration' => '5 jours / 4 nuits',
                'category' => 'Balneaire',
                'start_location' => 'Nosy Be',
                'end_location' => 'Nosy Be',
                'status' => 'inactive',
                'images' => [
                    [
                        'image_url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
                        'is_cover' => true,
                        'caption' => 'Plage tropicale',
                    ],
                    [
                        'image_url' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=80',
                        'is_cover' => false,
                        'caption' => 'Excursion en bateau',
                    ],
                ],
                'programs' => [
                    [
                        'day_number' => 1,
                        'title' => 'Arrivee a Nosy Be',
                        'description' => 'Accueil, transfert a l\'hotel et fin de journee libre.',
                        'activities' => 'Transfert, plage, coucher de soleil.',
                    ],
                    [
                        'day_number' => 2,
                        'title' => 'Excursion Nosy Tanikely',
                        'description' => 'Sortie en bateau pour baignade et snorkeling dans une reserve marine.',
                        'activities' => 'Bateau, snorkeling, dejeuner plage.',
                    ],
                ],
                'inclusions' => [
                    'Transferts aeroport',
                    'Hebergement avec petit dejeuner',
                    'Excursion en bateau',
                ],
                'exclusions' => [
                    'Billets avion',
                    'Repas libres',
                    'Activites optionnelles',
                ],
                'reviews' => [
                    [
                        'name' => 'Marc Dubois',
                        'rating' => 4,
                        'review' => 'Tres bon sejour pour tester la partie reservation et les pages publiques.',
                        'status' => 'publish',
                    ],
                ],
            ],
        ];

        foreach ($tours as $tourData) {
            $images = $tourData['images'];
            $programs = $tourData['programs'];
            $inclusions = $tourData['inclusions'];
            $exclusions = $tourData['exclusions'];
            $reviews = $tourData['reviews'];

            unset($tourData['images'], $tourData['programs'], $tourData['inclusions'], $tourData['exclusions'], $tourData['reviews']);

            $tour = Tour::updateOrCreate(
                ['slug' => Str::slug($tourData['title'])],
                array_merge($tourData, ['slug' => Str::slug($tourData['title'])])
            );

            foreach ($images as $image) {
                $tour->images()->updateOrCreate(
                    ['image_url' => $image['image_url']],
                    $image
                );
            }

            foreach ($programs as $program) {
                $tour->programs()->updateOrCreate(
                    ['day_number' => $program['day_number']],
                    $program
                );
            }

            foreach ($inclusions as $description) {
                $tour->inclusions()->updateOrCreate(
                    ['description' => $description],
                    ['description' => $description]
                );
            }

            foreach ($exclusions as $description) {
                $tour->exclusions()->updateOrCreate(
                    ['description' => $description],
                    ['description' => $description]
                );
            }

            foreach ($reviews as $review) {
                $tour->reviews()->updateOrCreate(
                    ['name' => $review['name']],
                    $review
                );
            }
        }
    }
}
