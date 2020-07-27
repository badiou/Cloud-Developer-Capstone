import * as uuid from 'uuid'

import { Categorie } from '../models/Categorie'
import { CategoriesAccess } from '../dataLayer/categoriesAccess'
import { CreateCategorieRequest } from '../requests/CreateCategorieRequest'
import { getUserId } from '../auth/utils'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { UpdateCategorieRequest } from '../requests/UpdateCategorieRequest';

const categorieAccess = new CategoriesAccess()

export async function getAllCategories(): Promise<Categorie[]> {
  return categorieAccess.getAllCategories()
}

export async function createCategorie(
    createCategoriesRequest: CreateCategorieRequest,
  jwtToken: string
): Promise<Categorie> {

  const itemId = uuid.v4()
  const userId = getUserId(jwtToken)
  return await categorieAccess.createCategorie({
    id: itemId,
    userId: userId,
    name: createCategoriesRequest.name,
    description: createCategoriesRequest.description
  })
}

export async function deleteCategorie(event: APIGatewayProxyEvent,
  jwtToken: string){
  //get todoId from the parameters that user send to url
const categorieId = event.pathParameters.categorieId;
 //get user by id
const userId = getUserId(jwtToken);
const validCategorie=categorieAccess.categorieExists(categorieId,userId)
if (!validCategorie){ // it means that the categorie does not exist

    return false}
else{
  const categorieHaveBook=categorieAccess.haveNoBookWithThisCategorie(categorieId,userId)

    if(categorieHaveBook){
      return false //avoid to delete catagories where these have the book

    }
    else{
      await categorieAccess.deleteCategorie(categorieId,userId)
      return true

    }
  }
}

export async function updateCategorie(event: APIGatewayProxyEvent,updateCategorieRequest: UpdateCategorieRequest,jwtToken: string){
    
  const categorieId = event.pathParameters.categorieId;
  
  const userId = getUserId(jwtToken);

  const validCategorie= categorieAccess.categorieExists(categorieId,userId)
  
  if (!validCategorie){ 

      return false}
  else
  {   await categorieAccess.updateCategorie(categorieId, userId, updateCategorieRequest)
      
      return true}
}



