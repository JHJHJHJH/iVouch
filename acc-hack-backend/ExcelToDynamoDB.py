#!/usr/bin/env python
# coding: utf-8

# In[49]:


#Importing
import pandas as pd
from pandas import *
import numpy as np
import boto3
from botocore.exceptions import ClientError
import requests
import os
import datetime
from decimal import Decimal


# In[58]:


def UpdateTableToDynamoDB(filepath, primary_column_name = "Index No."):
    
    def TableExist(tableName):
        tableNames = client.list_tables()['TableNames']
        return tableName in tableNames
    
    def CreateOrGetTable(tableName, primaryColumnName):
        if TableExist(tableName): #Retrieve table
            table =  dynamodb.Table(tableName)
        else: #Create new table
            table = dynamodb.create_table(
                TableName=tableName,
                # HASH is for Partition key
                KeySchema=[{'AttributeName': primaryColumnName,'KeyType': 'HASH' }],
                AttributeDefinitions=[{'AttributeName': primaryColumnName, 'AttributeType': 'N'}],
                ProvisionedThroughput={'ReadCapacityUnits': 10,'WriteCapacityUnits': 10}
            )
        return table
       
    #table = dynamodb's table, dataframe = pandas' dataframe
    def AddItemsIntoTable(dynamoDBtable, header, numpyarrays, primaryColumnName): 

        def UpdateToItemFormat(arraydata):
            doubleHeaders = ['gl account', 'entry no.', 'debit', 'credit']
            stringHeaders = ['date', 'account description', 'your reference', 'description', 'debtor', 'creditor']
            item = dict()
            for h,ad in zip(header, arraydata):
                if h.lower() in stringHeaders:
                    if type(ad) is pd._libs.tslibs.timestamps.Timestamp: item[h] = str(ad) 
                    elif str(ad).lower() in ['infinity', 'nan']:  item[h] = ""
                    else: item[h] = str(ad)
                elif h.lower() in doubleHeaders:
                    if str(ad).lower() in ['infinity', 'nan']:  
                        item[h] = Decimal(0) 
                    else: 
                        item[h] = Decimal(str(ad))
                else: item[h] = ad
            print(item)
            return item
        
        def ItemExistInTable(item): #Return null if item is not in dynamodb table
            try:
                response = table.get_item(Key=item)
            except:
                return False
            else:
                return True

        def UpdateItem(item): #Update the item in the dynamodb table
            def ConvertItemToExpression(item):
                def colnum_string(n):
                    string = ""
                    while n > 0:
                        n, remainder = divmod(n - 1, 26)
                        string = chr(65 + remainder) + string
                    return string
                expr = ""
                exprattri = dict()
                ind = 1
                for key,value in item.items():
                    abbr = ":" + colnum_string(ind)
                    if ind == 1:
                        expr = expr + "set " + key + "=" + abbr
                    else:
                        expr = expr + ", " + key + "=" + abbr
                    exprattri[abbr] = value
                    ind = ind + 1
                return [expr,exprattri]
                
            expressiondata = ConvertItemToExpression(item)
            response = dynamoDBtable.update_item(
                Key=item,
                UpdateExpression = expressiondata[0],
                ExpressionAttributeValues = expressiondata[1]
            )
            return response
        
        def AddItem(item):
            response = dynamoDBtable.put_item(Item = item)   
            return response
        
        responses = list()
        uniqueIdIndex = 0
        for numpyarray in numpyarrays:
            i = UpdateToItemFormat(numpyarray)
            i[primaryColumnName] = uniqueIdIndex
            if ItemExistInTable(i): responses.append(UpdateItem(i))
            else: responses.append(AddItem(i))
            uniqueIdIndex = uniqueIdIndex + 1
        return responses
    
    dynamodb = boto3.resource('dynamodb') #Instantiate your dynamoDB resource object
    client = boto3.client('dynamodb')  #Instantiate your dynamoDB client object

    #Get the file details
    filename_w_ext = os.path.basename(filepath)
    filename_detail = os.path.splitext(filename_w_ext)
    filename_wo_ext = filename_detail[0].replace(' ','_') #Used as tableName
    filename_ext = filename_detail[1]
    
    #Transform excel to df/nparray
    dataframe = pd.read_excel(filepath)
    all_headers = dataframe.columns.values
    numpyArrays = dataframe.to_numpy()
    
    #Get the primary column name
    Primary_Column_Name = next((header for header in all_headers if header.lower() == primary_column_name.lower()),primary_column_name) 

    #Get or create table
    table = CreateOrGetTable(filename_wo_ext, Primary_Column_Name)
    
    #Update or add items into table
    responses = AddItemsIntoTable(table, all_headers,numpyArrays, Primary_Column_Name)        
    
    return responses


# In[59]:


table = UpdateTableToDynamoDB(r'D:\Singapore Institute Of Technology\Loh Jun Han - Accountinghack\Test Data\Ledger\Sample accounting entries list.xlsx')
print(table)


# In[11]:


dataframe = pd.read_excel(r'D:\Singapore Institute Of Technology\Loh Jun Han - Accountinghack\Test Data\Ledger\Sample accounting entries list.xlsx')


# In[12]:


all_headers = dataframe.columns.values
numpyArrays = dataframe.to_numpy()
def UpdateToItemFormat(arraydata,header):
    doubleHeaders = ['gl account', 'your reference', 'entry no.', 'debit', 'credit']
    stringHeaders = ['date', 'account description', 'description', 'debtor', 'creditor']
    item = dict()
    for h,ad in zip(header, arraydata):
        if str(ad).lower() in ['infinity', 'nan']:
            if h.lower() in stringHeaders:
                item[h] = "" 
            elif h.lower() in doubleHeaders:
                item[h] = Decimal(0) 
        elif isinstance(ad,float) :
            update = Decimal(ad)
            if ad == float('NaN') or ad == float('Inf') or str(ad) in ['Infinity', 'NaN']: item[h] = Decimal(0)
            else:item[h] = Decimal(ad)
        elif type(ad) is pd._libs.tslibs.timestamps.Timestamp: item[h] = str(ad) 
        else: item[h] = ad
    return item

def ConvertItemToExpression(item):
    def colnum_string(n):
        string = ""
        while n > 0:
            n, remainder = divmod(n - 1, 26)
            string = chr(65 + remainder) + string
        return string
    expr = ""
    exprattri = dict()
    ind = 1
    for key,value in item.items():
        abbr = ":" + colnum_string(ind)
        if ind == 1:
            expr = expr + "set " + key + "=" + abbr
        else:
            expr = expr + ", " + key + "=" + abbr
        exprattri[abbr] = value
        ind = ind + 1
    return [expr,exprattri]

test = list()
for numpyArray in numpyArrays:
    item = UpdateToItemFormat(numpyArray, all_headers)
    test.append(item)

#vfunc = np.vectorize(UpdateToItemFormat)
#vfunc(numpyArray, all_headers)
print(test)


# In[13]:


print(test1)
print(float('Nan'))


# In[5]:


print(dataframe.columns.values)


# In[5]:


subsetdf = dataframe.to_dict('list') #Transform dataframe to dictory

PrimaryColumnRef = "your reference"
Primary_Column_Name = next((key for key in subsetdf.keys() if key.lower() == PrimaryColumnRef.lower()),None)

if not Primary_Column_Name: raise ValueError("Primary column name not found. ParameterName: Primary_Column_Name") #Stop the operation if primary key not found
print(subsetdf)


# In[ ]:





# In[97]:


#client = boto3.client('dynamodb', region_name='ap-southeast-1')

tableName = 'Music'
Primary_Column_Name = 'Artist'
Primary_Key = 'JunKang'
#columns=["Temperature","Humidity"]

db = boto3.resource('dynamodb')
table = db.Table('Testing')
print(table)


# In[98]:


response = table.get_item(
        Key = 
            {
                'Pr':'hi'
            }
        )


# In[99]:


response["Item"]


# In[ ]:




