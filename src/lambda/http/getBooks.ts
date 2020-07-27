import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'


const docClient = new AWS.DynamoDB.DocumentClient()

const categoriesTable = process.env.CATEGORIES_TABLE
const booksTable = process.env.BOOKS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event: ', event)
 

  const categorieId = event.pathParameters.categorieId
  const validCategorieId=await categorieExists(categorieId)

 if(!validCategorieId) {
  return {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
     error: 'Categorie does not exist'
    })
  }
 }

 const books =await getBooksPerCategorie(categorieId)

 return{
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
   items: books
  })

 }

}

//cette fonction permet de vérifier si le categorie recherché existe dans la base de données ou pas
async function categorieExists(categorieId: string){
  const result=await docClient
  .get({
    TableName: categoriesTable,
    Key: {
      id : categorieId
    }
  })
  .promise()
  console.log('Get categorie:', result)
  return !!result.Item

}

async function getBooksPerCategorie(categorieId: string){
  const result=await docClient
  .query({
    TableName: booksTable,
    KeyConditionExpression: 'categorieId = :categorieId',
    ExpressionAttributeValues:{
      ':categorieId': categorieId
    },
    //ScanIndexForward: false permet de faire un orderby desc
    ScanIndexForward: false

  })
  .promise()
  return result.Items

}
