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


help(ivouch.get_data_by_key)


# In[5]:


help(ivouch.match_ledger_with_statements_and_invoice)


# In[6]:


help(ivouch.set_ledger_headers)


# In[7]:


help(ivouch.reset_ledger_headers)


# In[8]:


c = ivouch.get_data_by_key()
c


# In[9]:


ledgers = ivouch.ledgers
ledgers


# In[10]:


bankstatements = ivouch.bankstatements
bankstatements


# In[11]:


invoices = ivouch.invoices
invoices


# In[12]:


dd = ivouch.match_ledger_with_statements_and_invoice()
dd


# In[13]:


test = list(filter(lambda ledger: ledger.is_invoice, dd))
test


# In[14]:


a = list()
for t in test:
    a.append([t.entry_data, t.matched_invoice])
a


# In[15]:


invoiceeledger = [list(map(lambda ledger: ledger.entry_data,test)),list(map(lambda ledger: ledger.matched_invoice,test))]
list(zip(*invoiceeledger))


# In[16]:


test1 = list(filter(lambda ledger: ledger.is_statement, dd))


# In[17]:


statementledger = [list(map(lambda ledger: ledger.entry_data,test1)),list(map(lambda ledger: ledger.matched_statement,test1))]
list(zip(*statementledger))


# In[18]:


statementledger[1]


# In[ ]:





# In[ ]:




