import sys
import enum
import json
import pandas as pd
import numpy as np
import boto3
import decimal
from decimal import Decimal

class matching_result(enum.Enum):
    NotChecked = 0
    Correct = 1
    Wrong = 2
    Missing = 3
    Invalid = 4

class ivouch():

    dynamodb_client = boto3.client('dynamodb')  #Instantiate your dynamoDB client object
    dynamodb_resource = boto3.resource('dynamodb') #Instantiate your dynamoDB resource object
    __default_table_name = 'ivouch' #Default table name
    __default_username = 'admin'  #Default user name
    __default_project_name = 'proj123'  #Default project name
    __ledgerclasses = list()
    username, project_name = None, None
    ledgers,invoices,bankstatements = list(), list(), list()
    reference = 'Reference'
    debit = 'Debit'
    debitor = 'Debtor'
    credit = 'Credit'
    creditor = 'Creditor'
    account_description = 'Account description'

    __default_ledger_and_statement_headers = { debit:'Credits', credit:'Debits' }
    __default_ledger_and_invoice_headers = { reference:'invoice_number', debit:'invoice_amount', creditor:'seller_name' }

    def set_ledger_headers(
        reference_column:str = None, 
        debit_column:str = None,
        debitor_column:str = None, 
        credit_column:str = None, 
        creditor_column:str = None,
        account_description_column:str = None,):
        """
        reference_column -> the column name to be used as a reference
        debit_column -> the column name to be used as debit
        credit_column -> the column name to be used as credit
        creditor_column -> the column name to be used as creditor
        account_description_column -> the column name to be used as account description

        This method will attempts to force set the column headers for the ledger to be used.
        """
        if reference_column: ivouch.reference = reference_column
        else: ivouch.reference = 'Reference'
        if debit_column: ivouch.debit = debit_column
        else: ivouch.debit = 'Debit'
        if debitor_column: ivouch.debitor = debitor_column
        else: ivouch.debitor = 'Debit'
        if credit_column: ivouch.credit = credit_column
        else: ivouch.credit = 'Debtor'
        if creditor_column: ivouch.creditor = creditor_column
        else: ivouch.creditor = 'Creditor'
        if account_description_column: ivouch.account_description = account_description_column
        else: ivouch.account_description = 'Account description'
    
    def reset_ledger_headers():
        """
        This method will reset the column headers for the ledger.
        """
        ivouch.set_ledger_headers()

    def __get_table_by_name(tablename: str):
        """
        tablename -> the name of the table to be retrieved
        return -> the dynamoDB table

        This method will attempts to get the dynamoDB's table by name
        """
        tablenames = ivouch.dynamodb_client.list_tables()['TableNames']
        if tablename in tablenames:
            return ivouch.dynamodb_resource.Table(tablename)
        else:
            raise Exception("No such table with name '" + tablename + "' found in DynamoDB")
    
    def get_data_by_key(
        username : str = None, 
        projectname : str = None) -> dict:
        """
        username -> the user that is logging in
        projectname -> the project name that is of interest
        return -> a dictionary of the project items

        Use this method to retrieve all the data from the dynamoDB. 
        """
        if not username: ivouch.username = ivouch.__default_username
        else: #Check if inputs are string
            if not isinstance(username, str): raise TypeError("Invalid input type, only string is allowed. \nParametername: username")
            else: ivouch.username = username 
        partitionkey = { 'username': ivouch.username } 

        if not projectname: ivouch.project_name = ivouch.__default_project_name 
        else: #Check if inputs are string
            if not isinstance(projectname, str): raise TypeError("Invalid input type, only string is allowed. \nParametername: projname")
            else: ivouch.project_name =  projectname
        projectnamekey = ivouch.project_name

        table = ivouch.__get_table_by_name(ivouch.__default_table_name)
        response = table.get_item(Key=partitionkey)
        if not 'Item' in response: raise TypeError("No items found for user name: " + username +". Please select other user name")

        response = json.loads(json.dumps(response["Item"], default= ivouch.decimal_default))

        allitems =  response['projects']
        selectprojitem = next((allitem for allitem in allitems if allitem['name'] == projectnamekey),None)
        if not selectprojitem: raise TypeError("No items found for project name: " + projectnamekey +". Please select other project name")
        
        ivouch.ledgers = selectprojitem['ledger']
        ivouch.__ledgerclasses = [ivouch.ledger_entry(ledger) for ledger in ivouch.ledgers]
        ivouch.invoices = selectprojitem['invoices']
        ivouch.bankstatements = selectprojitem['statement']

        return selectprojitem
    
    def decimal_default(obj):
        if isinstance(obj, Decimal):
            return float(obj)

    def match_ledger_with_statements_and_invoice(
        statement_headers_to_match : dict = None,
        invoice_headers_to_match : dict = None):
        """
        statement_headers_to_match -> {'ledger header1' : 'statement header1', 'ledger header2' : 'statement header2', ...}
        invoice_headers_to_match -> {'ledger header1' : 'invoice header2', 'ledger header1' : 'invoice header2', ...}

        This method will attempts to match any valid entries in the ledger with all of the bankstatements and invoices
        """
        invalid_header_message = 'Failed to find matching headers with ledger data for {0}.\nPlease use set_ledger_headers() if you want to set corresponding ledger headers or reset_ledger_headers() if you want to result the ledger headers.'
        
        def check_headers(key_headers:dict, value_headers: dict) -> dict:
            if not value_headers: return key_headers
            else:
                for key in key_headers.keys():
                    if not key in value_headers: return None  
                return value_headers 
        
        statement_headers = check_headers(ivouch.__default_ledger_and_statement_headers, statement_headers_to_match)
        if not statement_headers:
            raise ValueError(invalid_header_message.format('bank statements'))

        invoice_headers = check_headers(ivouch.__default_ledger_and_invoice_headers, invoice_headers_to_match)
        if not invoice_headers:
            raise ValueError(invalid_header_message.format('invoices'))

        if not ivouch.ledgers: ivouch.get_data_by_key(ivouch.username,ivouch.project_name) #Attempts to reset the ledger infomation as no ledger is found

        for l in filter(lambda ledger: ledger.requires_matching(), ivouch.__ledgerclasses):
            if l.is_invoice: l.match_with_invoice(ivouch.invoices, invoice_headers)
            if l.is_statement: l.match_with_bankstatement(ivouch.bankstatements, statement_headers)
        
        return ivouch.__ledgerclasses

    class ledger_entry():
        entry_data = dict()
        is_invoice, is_statement = False, False
        matched_invoice, matched_statement = None, None
        wrong_invoice, wrong_statement = None, None
        
        result_invoice = matching_result.NotChecked
        result_bankstatement = matching_result.NotChecked
        result_hashing = {
            matching_result.NotChecked:'This ledger entry has not been checked yet',
            matching_result.Correct:'This ledger entry has a matching invoice or/and bankstatement with correct information',
            matching_result.Wrong:'This ledger entry has a matching invoice or/and bankstatement with wrong/missing information',
            matching_result.Missing:'This ledger entry does not have a matching invoice/bankstatement',
            matching_result.Invalid:'This ledger entry does not require vouching'}

        def __init__(self, entry_data : dict):
            self.entry_data = entry_data
            self.requires_matching()
        
        def match_with_invoice(self, invoices : list, invoice_headers_to_match : dict) -> dict:
            """
            invoices -> list of invoices in dict format e.g: [{invoice1}, {invoice2}]
            invoice_headers_to_match -> dictionary where ledger headers are matched with invoices header e.g:{ledgerheader1:invoiceheader1,...}
            return -> a dictionary of invoice data if any matching data is found
            """
            ref = ivouch.reference
            entry_ref = str(self.entry_data[ref])
            invoice_ref_header = invoice_headers_to_match[ref]

            creditor = ivouch.creditor
            entry_creditor = str(self.entry_data[creditor])
            invoice_creditor_header = invoice_headers_to_match[creditor]

            debit = ivouch.debit
            entry_debit = self.entry_data[debit]
            if not isinstance(entry_debit, float): entry_debit = self.__convert_to_float(entry_debit)
            invoice_debit = invoice_headers_to_match[debit]

            for invoice in invoices:
                invoice_ref = str(invoice[invoice_ref_header])
                invoice_creditor = str(invoice[invoice_creditor_header])
                if entry_ref.lower() == invoice_ref.lower() and (invoice_creditor.lower() in entry_creditor.lower() or entry_creditor.lower() in invoice_creditor.lower()): #correct header value found
                    invoice_amount = invoice[invoice_debit]
                    if not isinstance(invoice_amount, float): invoice_amount = self.__convert_to_float(invoice_amount)
                    self.matched_invoice = invoice
                    if entry_debit == invoice_amount: # Correct invoice with correct information obtained
                        self.result_invoice = matching_result.Correct
                        return self.matched_invoice 
                    else: # Correct invocie with wrong information
                        self.result_invoice = matching_result.Wrong
                        self.wrong_invoice = invoice  
                else:
                    if not (self.result_invoice == matching_result.Wrong or self.result_invoice == matching_result.Correct):
                        self.result_invoice = matching_result.Missing

        def match_with_bankstatement(self, bankstatements: list, bankstatement_headers_to_match: dict) -> dict:
            """
            bankstatements -> list of bankstatements in dict format e.g: [{bankstatement1}, {bankstatement2}]
            bankstatement_headers_to_match -> dictionary where ledger headers are matched with bankstatements header e.g:{ledgerheader1:bankstatementheader1,...}
            """
            debit = ivouch.debit
            entry_debit = self.entry_data[debit]
            if not isinstance(entry_debit, float): entry_debit = self.__convert_to_float(entry_debit)
            bankstatement_credit_header = bankstatement_headers_to_match[debit]

            credit = ivouch.credit
            entry_credit = self.entry_data[credit]
            if not isinstance(entry_credit, float): entry_credit = self.__convert_to_float(entry_credit)
            bankstatement_debit_header = bankstatement_headers_to_match[credit]

            for bankstatement in bankstatements:
                bankstatement_credit = bankstatement[bankstatement_credit_header]
                bankstatement_debit = bankstatement[bankstatement_debit_header]
                if not isinstance(bankstatement_credit,float): bankstatement_credit = self.__convert_to_float(bankstatement_credit)
                if not isinstance(bankstatement_debit,float): bankstatement_debit = self.__convert_to_float(bankstatement_debit)
                if bankstatement_credit == entry_debit and bankstatement_debit == entry_credit:
                    self.matched_statement = bankstatement
                    self.result_bankstatement = matching_result.Correct
                    return self.matched_statement
                else:
                    self.result_bankstatement = matching_result.Missing

        def requires_matching(self) -> bool:
            if 'DBS - Bank Account' in self.entry_data[ivouch.account_description]: self.is_statement = True
            else: self.result_bankstatement = matching_result.Invalid
            
            if self.entry_data[ivouch.reference] and  ('Accounts Payable' in self.entry_data[ivouch.account_description] or 'Accounts Receivable' in self.entry_data[ivouch.account_description]): self.is_invoice = True
            else: self.result_invoice = matching_result.Invalid
            
            return any([self.is_statement, self.is_invoice])
        
        def get_invoice_matching_result(self) -> str:
            return self.result_hashing[self.result_invoice]

        def get_bankstatement_matching_result(self) -> str:
            return self.result_hashing[self.result_bankstatement]

        def __convert_to_float(self, item):
            i = item
            if not isinstance(item, str):
                i = str(item)
            i = i.replace(',','')
            if i: return float(i)
            else: return float(0)
            