from flask import Flask, request
import requests
import boto3
from botocore.config import Config
import json
import traceback
import pandas as pd
import numpy as np
import pprint
import tabula
from decimal import Decimal
from boto3.dynamodb.conditions import Key
import time

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

@app.route("/api/uploadinvoice2", methods=['GET', 'POST'])
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

@app.route("/api/uploadinvoice", methods=['POST'])
def uploadinvoice():
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

        invoiceLst = []
        for result in results:
            prediction = result["prediction"]
            invoiceObj = {}
            for x in prediction:
                invoiceObj[ x["label"] ]= x["ocr_text"]
                print(x["label"] + " : " + invoiceObj[x["label"]])
            invoiceLst.append(invoiceObj)

        print("uploading invoice...")
        res = {"message": "Invoice upload succeeded!"}
        return json.dumps(invoiceLst), 200

    except Exception as e:
        err = {"message": str(e)}
        print(str(e))
        return json.dumps(err), 400

########################### Statement
@app.route("/api/uploadstatement", methods=['POST'])
def uploadstatement():
    data = request.files.getlist("file") ##files
    # Read pdf into list of DataFrame
    dfLst = tabula.read_pdf(data[0], pages='all', output_format='dataframe')
    df = dfLst[0]
    print(df)
    df = df.replace(np.nan, '', regex=True)

    dic = df.to_dict(orient='records')
    obj = json.dumps(dic, indent=4 ,sort_keys=True, default=str)

    pp = pprint.PrettyPrinter(indent=4)
    pp.pprint(obj)
    print("uploading statement...")
    res = {"message": "Statement upload succeeded!"}
    return obj, 200

########################### Ledger
@app.route("/api/uploadledger", methods=['POST'])
def uploadledger():
    data = request.files.getlist("file")

    df = pd.read_excel(data[0]) #assume 1 ledger file
    df = df.replace(np.nan, '', regex=True)

    dic = df.to_dict(orient='records')
    obj = json.dumps(dic, indent=4 ,sort_keys=True, default=str)

    # pp = pprint.PrettyPrinter(indent=4)
    # pp.pprint(obj)
    print("uploading ledger...")
    res = {"message": "Ledger upload succeeded!"}
    return obj, 200


##################### GET INVOICES
@app.route("/api/getinvoice", methods = ['GET'])
def getinvoice():
    try:
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table("invoices")
        response = table.scan()
        

    except Exception as e:
        err = {"message": str(e)}
        print(str(e))
        return json.dumps(err), 400

################### NEW PROJECT
@app.route("/api/newproject2", methods = ['POST'])
def newproject():
    try:
        content = json.loads( json.dumps(request.json) , parse_float=Decimal)
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table("ivouch")
        
        response = table.put_item(
            Item = content
        )       
        print("creating new project...")
        return response, 200

    except Exception as e:
        err = {"message": str(e)}
        print(str(e))
        return json.dumps(err), 400

################### NEW PROJECT

def projectExist(allProjects, checkProject ):
    allProjectNames = [ p['name'] for p in allProjects]
    if (checkProject in allProjectNames):
        return True
    else:
        return False
               
        
@app.route("/api/newproject", methods = ['POST', 'GET'])
def newproject2():
    try:
        data = json.loads( json.dumps(request.json) , parse_float=Decimal)
        reqUser = data['username']
        reqProjectName = data['projects'][0]['name']
        reqProjectData = data['projects'][0]

        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table("ivouch")

        #get key
        response = table.get_item(
            Key = {
                'username': reqUser
            }
        )
        temp = response
        if 'Item' in temp: #if user EXISTS 
            dbJson = temp['Item']
            dbProjects = dbJson['projects']
            #if project exist, update 
            #if new project, add new obj to ['projects']
            if projectExist( dbProjects, reqProjectName ): #IF Project exists
                #UPDATE existing project

                raise Exception (reqProjectName + " exists ! Please use a unique project name")

                #PUT ITEM TO REPLACE
                # for i in range( len(dbProjects)):
                #     if dbJson['projects'][i]['name'] == reqProjectName:
                #         dbJson['projects'][i]['information'] = reqProjectData['information']
                #         dbJson['projects'][i]['invoices'] = reqProjectData['invoices']
                #         dbJson['projects'][i]['ledger'] = reqProjectData['ledger']
                #         dbJson['projects'][i]['statement'] = reqProjectData['ledger']

                # response = table.put_item(
                #     Item = dbJson,
                #     ReturnValues='ALL_OLD',
                # )
                # return json.dumps(response["Attributes"], default=decimal_default), 200
            else: #IF Project does not exist
                #ADD NEW to ['projects']
                response = table.update_item(
                    Key={
                        'username': reqUser
                    },
                    UpdateExpression= "SET #p = list_append(#p, :data)",
                    ExpressionAttributeNames = {
                        '#p' : 'projects',
                    },
                    ExpressionAttributeValues= {
                        ':data': [reqProjectData]
                    },
                    ReturnValues="UPDATED_NEW"
                )
                body = {"message": "success"}
                body["Item"] = response["Attributes"]
                return json.dumps(body, default=decimal_default), 200
        else: #ELSE IF  USER DOES NOT EXIST
            raise Exception("User does not exist !")

    except Exception as e:
        err = {"message": str(e)}
        print(str(e))
        return json.dumps(err), 400

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

@app.route("/api/projects", methods = ['GET','POST'])
def getprojectinfo():
    try:
        content = request.json
        
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table("ivouch")
        response = table.get_item(
            Key = content
        )
        time.sleep(2)
        return json.dumps(response["Item"], default=decimal_default), 200

    except Exception as e:
        err = {"message": str(e)}
        print(str(e))
        return json.dumps(err), 400

if __name__ == "__main__":
    app.run()