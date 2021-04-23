import React, { useEffect, useState } from 'react';
import { Layout, Skeleton, Select, Table, Form, Button } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import domo from 'ryuu.js'
import './App.css';

// TODO: add thumbs up, thumbs down, write to appdb and join data
// say: workflows are going to be similar, if you're annotating data it's the exact same thing, adding tags, etc. Same for filtering, date ranges, etc.

function App() {
  const [tableData, setTableData] = useState();
  const [annotationData, setAnnotationData] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setTableData();
    let query
    if (filter === 'all') {
      query = '/data/v1/leads?fields=id,name,title,company_name,city,state&limit=100';
    } else {
      query = `/data/v1/leads?fields=id,name,title,company_name,city,state&limit=100&filter=state contains '${filter.toUpperCase()}'`;
    }
    domo.get(query).then(data => {
      setTableData(data);
    });
  }, [filter]);

  useEffect(() => {
    setAnnotationData();
    domo.get('/domo/datastores/v1/collections/leadResults/documents/')
      .then(data => {
        const mappedData = {};
        data.forEach(datum => {
          mappedData[datum.content.id] = datum.content.isInterested === 'true';
        });
        setAnnotationData(mappedData)
    });
  }, []);

  function setIsInterested(id, interested) {
    setAnnotationData({ ...annotationData, [id]: interested })
    domo.post(`/domo/datastores/v1/collections/leadResults/documents/`, { content: { id, isInterested: interested.toString() } })
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
    },
    {
      title: 'Interested',
      dataIndex: 'interested',
      key: 'interested',
      render: (interested, record) => {
        if (interested !== undefined) {
          return <>{interested ? 'Yes' : 'No'}</>
        }

        return (
          <>
            <Button type="primary" onClick={() => setIsInterested(record.id, true)}>
              <CheckOutlined />
            </Button>
            <Button style={{ marginLeft: 20 }} danger onClick={() => setIsInterested(record.id, false)}>
              <CloseOutlined />
            </Button>
          </>
        )
      }
    }
  ];


  let joinedTableData;
  if (tableData !== undefined) {
    joinedTableData = tableData.map(datum => ({
      ...datum,
      interested: annotationData[datum.id],
    }))
  }

  const table = joinedTableData === undefined
    ? <Skeleton active />
    : <Table dataSource={joinedTableData} columns={columns} />;

  return (
    <Layout.Content>
      <Form
        layout="inline"
        style={{ marginBottom: 16 }}
      >
        <Form.Item label="State">
          <Select value={filter} onChange={setFilter} style={{ width: 120 }}>
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="tx">Texas</Select.Option>
          </Select>
        </Form.Item>
      </Form>
      {table}
      Hello
    </Layout.Content>
  );
}

export default App;
