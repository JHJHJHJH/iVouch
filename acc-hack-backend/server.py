from flask import Flask, request
import requests
import boto3
from botocore.config import Config
import json
import traceback
import pandas as pd
import numpy as np

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

@app.route("/api/uploadinvoice", methods=['GET', 'POST'])
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

        res = {"message": "Invoice upload succeeded!"}
        return json.dumps(res), 200

    except Exception as e:
        err = {"message": str(e)}
        print(str(e))
        return json.dumps(err), 400


##########TEST post file
@app.route("/api/postfile", methods=['GET', 'POST'])
def postfile():
    data = request.files.getlist("file")

    for d in data:
        testvar =  [ ('file', d.read()) ]
        print (testvar)

    return "read!"
########################### Statement
@app.route("/api/uploadstatement", methods=['POST'])
def uploadstatement():
    data = request.files.getlist("file") ##files
    
    #TODO
        #read pdf
        #transform pdf into table
        #post to db



    res = {"message": "Statement upload succeeded!"}
    return json.dumps(res), 200

########################### Ledger
@app.route("/api/uploadledger", methods=['POST'])
def uploadledger():
    data = request.files.getlist("file")

    #TODO
    #read excel , pd.read_xlsx(data[0])
    f = pd.read_excel(data[0])
    print(f)
    #transform excel into table
    #post to db
    res = {"message": "Ledger upload succeeded!"}
    return json.dumps(res), 200

@app.route("/api/getinvoice", methods = ['GET'])
def getinvoice():
    try:
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table("invoices")
        response = table.scan()
        return response, 200

    except Exception as e:
        err = {"message": str(e)}
        print(str(e))
        return json.dumps(err), 400

if __name__ == "__main__":
    app.run()