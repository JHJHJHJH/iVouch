from flask import Flask, request
import requests
import boto3
from botocore.config import Config
import json
import traceback

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello world"


def filterInvoiceNum(header):
    if( header["label"] == "invoice_number"):
        return True
    else:
        return False

###############
def putInvoice( entry ):
    
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("invoices")

    obj = {}
    for x in entry:
        obj[x["label"]]= x["ocr_text"]
        print(x["label"] + " : " + obj[x["label"]])

    succeeded = True
    while ( succeeded ):
        try:
            response = table.put_item(
                Item = obj,
                ConditionExpression = "attribute_not_exists(invoice_number)"
            )
            if (response['ResponseMetadata']['HTTPStatusCode']== 200):
                succeeded = False

        except Exception as e:
            if (e.__class__.__name__ == "ConditionalCheckFailedException"):
                if  ord(obj["invoice_number"][-1]) > 47 and ord(obj["invoice_number"][-1]) < 58:
                    obj["invoice_number"] = obj["invoice_number"] [0:len(obj["invoice_number"])-1 ] + str(( int(obj["invoice_number"][-1])+1))
                else :
                    obj["invoice_number"] = obj["invoice_number"] + "0"

                continue
    return response["ResponseMetadata"]["HTTPStatusCode"]  
###############

@app.route("/api/testnano", methods=['GET', 'POST'])
def ocr():
    try:
        data = request.files.getlist("file")

        print('reading...')
        files = []
        for d in data:
            print(d)
            files.append(('file', d.read()))
            
        url = "https://app.nanonets.com/api/v2/OCR/Model/298a2eb1-5582-436a-946b-f905012e90d2/LabelFile/"

        payload = {}

        headers = {
            'accept': 'multipart/form-data',
            'Authorization': 'Basic TUpxbW82VnBqcXFfZXhOT2d5SUdrYTFaYUM2U19FWUg6'
        }
        
        print("Posting to nanonets...")
        response1 = requests.request("POST", url, headers=headers, data = payload, files = files)

        results = response1.json()["result"]

        for result in results:
            predictions = result["prediction"]
            if len(predictions) > 0:
                invoiceNum = list(filter( filterInvoiceNum, predictions))
                if len(invoiceNum) > 0:
                    putInvoice( predictions )
                else:
                    predictions.append( { "invoice_number" : "NoInvoiceNum" } )
                    putInvoice( predictions )

        return ("Done")

    except Exception as e:
        print(str(e))
        return(str(e))


##########TEST post file
@app.route("/api/postfile", methods=['GET', 'POST'])
def postfile():
    data = request.files.getlist("file")

    for d in data:
        testvar =  [ ('file', d.read()) ]
        print (testvar)

    return "read!"
###########################


if __name__ == "__main__":
    app.run()