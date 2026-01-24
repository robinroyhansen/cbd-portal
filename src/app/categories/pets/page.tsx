import { redirect } from 'next/navigation';

/**
 * Redirect old /categories/pets URL to new /pets hub
 */
export default function PetsCategoryRedirect() {
  redirect('/pets');
}
