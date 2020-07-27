import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';

import { deleteCategorie } from '../../businessLogic/categories';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  if (!(await deleteCategorie(event,jwtToken))) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Categorie does not exist'
      })
    };
  }

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
      
    },
    body: JSON.stringify({})
  };
}