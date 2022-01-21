"use strict";
/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten
exports.__esModule = true;
exports.listPersons = exports.getPerson = exports.listKudos = exports.getKudo = void 0;
exports.getKudo = "\n  query GetKudo($id: ID!) {\n    getKudo(id: $id) {\n      id\n      giverId\n      receiverId\n      message\n      kudoVerb\n      dataSourceApp\n      createdAt\n      link\n      metadata\n      giver {\n        id\n        username\n        email\n        dataSourceApp\n        kudosGiven {\n          nextToken\n        }\n        kudosReceived {\n          nextToken\n        }\n        createdAt\n        updatedAt\n      }\n      receiver {\n        id\n        username\n        email\n        dataSourceApp\n        kudosGiven {\n          nextToken\n        }\n        kudosReceived {\n          nextToken\n        }\n        createdAt\n        updatedAt\n      }\n      updatedAt\n    }\n  }\n";
exports.listKudos = "\n  query ListKudos(\n    $filter: ModelKudoFilterInput\n    $limit: Int\n    $nextToken: String\n  ) {\n    listKudos(filter: $filter, limit: $limit, nextToken: $nextToken) {\n      items {\n        id\n        giverId\n        receiverId\n        message\n        kudoVerb\n        dataSourceApp\n        createdAt\n        link\n        metadata\n        giver {\n          id\n          username\n          email\n          dataSourceApp\n          createdAt\n          updatedAt\n        }\n        receiver {\n          id\n          username\n          email\n          dataSourceApp\n          createdAt\n          updatedAt\n        }\n        updatedAt\n      }\n      nextToken\n    }\n  }\n";
exports.getPerson = "\n  query GetPerson($id: ID!) {\n    getPerson(id: $id) {\n      id\n      username\n      email\n      dataSourceApp\n      kudosGiven {\n        items {\n          id\n          giverId\n          receiverId\n          message\n          kudoVerb\n          dataSourceApp\n          createdAt\n          link\n          metadata\n          updatedAt\n        }\n        nextToken\n      }\n      kudosReceived {\n        items {\n          id\n          giverId\n          receiverId\n          message\n          kudoVerb\n          dataSourceApp\n          createdAt\n          link\n          metadata\n          updatedAt\n        }\n        nextToken\n      }\n      createdAt\n      updatedAt\n    }\n  }\n";
exports.listPersons = "\n  query ListPersons(\n    $filter: ModelPersonFilterInput\n    $limit: Int\n    $nextToken: String\n  ) {\n    listPersons(filter: $filter, limit: $limit, nextToken: $nextToken) {\n      items {\n        id\n        username\n        email\n        dataSourceApp\n        kudosGiven {\n          nextToken\n        }\n        kudosReceived {\n          nextToken\n        }\n        createdAt\n        updatedAt\n      }\n      nextToken\n    }\n  }\n";
