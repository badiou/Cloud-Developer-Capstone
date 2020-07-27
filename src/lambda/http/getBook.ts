import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'


const docClient = new AWS.DynamoDB.DocumentClient()


const booksTable = process.env.BOOKS_TABLE
const bookIdIndex=process.env.BOOK_ID_INDEX


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
console.log('Caller event ', event)
const bookId=event.pathParameters.bookId

const result=await docClient.query({
TableName: booksTable,
IndexName: bookIdIndex,
KeyConditionExpression: 'bookId = :bookId',
ExpressionAttributeValues: {
  ':bookId': bookId
}
}).promise()

if (result.Count !==0){
  return{
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(
     result.Items[0]
    )
  
   } 
}
  return{
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''

  }

}

