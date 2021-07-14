const cases = [10, 100, 1000, 10000, 100000, 1000000 ];
const query = `
START TRANSACTION;
DROP TABLE Persons;
CREATE TABLE Persons (
    PersonID number NOT_NULL AUTO_INCREMENT,
    Name string NOT_NULL,
    IsMale boolean NOT_NULL,
    PRIMARY KEY (PersonID)
);
`;
for (let index = 0; index < cases.length; index++) {
    const caseNumber = cases[index];
    const result = {
        caseNumber
    };
    const timeStart = new Date();
    const finalQuery = `${query} ${'INSERT INTO Persons (Name, IsMale) VALUES ("pipo", true);\n'.repeat(caseNumber)} END TRANSACTION;`;
    const data = await db.m.sql.queryPromise(finalQuery);
    const timeEnd = new Date();
    result.time = timeEnd.getTime() - timeStart.getTime();
    output(result);
}