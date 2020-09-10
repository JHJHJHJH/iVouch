#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
import numpy as np
import boto3
from botocore.exceptions import ClientError
import sys
import os


# In[2]:


import AECTech_Modules
from AECTech_Modules import *


# In[3]:


dir(ivouch)


# In[4]:


help(ivouch.ledger_entry)


# In[5]:


help(ivouch.get_data_by_key)


# In[6]:


help(ivouch.match_ledger_with_statements_and_invoice)


# In[7]:


help(ivouch.set_ledger_headers)


# In[8]:


help(ivouch.reset_ledger_headers)


# In[9]:


c = ivouch.get_data_by_key()
c


# In[10]:


ledgers = ivouch.ledgers
ledgers


# In[11]:


bankstatements = ivouch.bankstatements
bankstatements


# In[12]:


invoices = ivouch.invoices
invoices


# In[13]:


dd = ivouch.match_ledger_with_statements_and_invoice()


# In[14]:


test = list(filter(lambda ledger: ledger.is_invoice, dd))


# In[15]:


a = list()
for t in test:
    a.append([t.entry_data, t.matched_invoice])
a


# In[16]:


invoiceeledger = [list(map(lambda ledger: ledger.entry_data,test)),list(map(lambda ledger: ledger.matched_invoice,test))]
list(zip(*invoiceeledger))


# In[17]:


test1 = list(filter(lambda ledger: ledger.is_statement, dd))


# In[18]:


statementledger = [list(map(lambda ledger: ledger.entry_data,test1)),list(map(lambda ledger: ledger.matched_statement,test1))]
list(zip(*statementledger))


# In[19]:


statementledger[1]


# In[20]:


test3 = list(map(lambda l: l.get_invoiceentries(),test1))


# In[21]:


list(map(lambda l: l.entry_data,test1))


# In[24]:


[[tt.entry_data for tt in t] if t else t for t in test3]


# In[25]:


invoiceeledger[0]


s# In[ ]:




