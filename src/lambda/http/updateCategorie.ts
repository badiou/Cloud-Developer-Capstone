import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult,
  // APIGatewayProxyHandler, 
 } from 'aws-lambda'

import { UpdateCategorieRequest } from '../../requests/UpdateCategorieRequest'
import { updateCategorie } from '../../businessLogic/categories';



// export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const updatedCategorie: UpdateCategorieRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  if (!await updateCategorie(event,updatedCategorie,jwtToken)) {
 
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'This Todo does not exist'
      })
    };
  }

  return {
    statusCode: 200,
    body: ''
  }
})


handler.use(
  cors({ 
    credentials: true 
  })
)