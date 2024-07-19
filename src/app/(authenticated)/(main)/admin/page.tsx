'use client';

import React, { useState } from 'react';

import Link from 'next/link';

import MaxWidthWrapper from '@/components/max-width-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { useQuery } from 'convex/react';
import { set } from 'date-fns';

import AddPortfolioForm from './_components/add-portfolio-form';
import DeletePortfolioForm from './_components/delete-portfolio-form';
import DeleteSubmissionForm from './_components/delete-submission-form';
import EditPortfolioForm from './_components/edit-portfolio-form';

export default function Admin() {
  const [item, setItem] = useState<any>(null);
  const submissions = useQuery(api.submissions.getSubmissions);
  const portfolios = useQuery(api.portfolios.getAllPortfolios);
  const [isAddPortfolio, setIsAddPortfolio] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteSubmissionOpen, setIsDeleteSubmissionOpen] = useState(false);
  const [isDeletePortfolioOpen, setIsDeletePortfolioOpen] = useState(false);
  const user = useQuery(api.users.getMyUser);

  if (user?.isAdmin !== true) {
    return (
      <div className="text-muted-foreground py-16 flex flex-col items-center justify-center">
        <span>Sorry, you can not access this page.</span>
        <span>You need to be an admin.</span>
      </div>
    );
  }

  return (
    <>
      <MaxWidthWrapper className="pt-4 gap-4">
        <div>
          <span className="text-3xl md:text-4xl font-bold">Submissions</span>
          {submissions?.length === 0 ? (
            <div className="flex mt-4 items-center justify-center py-16 border rounded-md">
              <span className="text-muted-foreground">
                No submissions to review
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {submissions?.map((submission, idx) => (
                <Card
                  key={idx}
                  className="w-full rounded-md border border-border shadow-sm p-6"
                >
                  <div className="relative flex flex-col gap-2">
                    <Link
                      href={submission.link}
                      target="_blank"
                      className="flex flex-col gap-2"
                    >
                      <div>
                        <Badge
                          className={cn(
                            'capitalize text-foreground',
                            submission.status === 'pending' &&
                              'bg-yellow-700 hover:bg-yellow-800',
                            submission.status === 'completed' &&
                              'bg-green-700 hover:bg-green-800',
                          )}
                        >
                          {submission.status}
                        </Badge>
                      </div>
                      <span className="text-xl font-bold">
                        {submission.name}
                      </span>
                    </Link>

                    <div className="flex gap-2 items-center justify-start">
                      {submission.status === 'pending' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setItem(submission);
                            setIsAddPortfolio(true);
                          }}
                        >
                          Submit
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setItem(submission);
                            setIsDeleteSubmissionOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div>
          <span className="text-3xl md:text-4xl font-bold">Portfolios</span>
          {portfolios?.length === 0 ? (
            <div className="flex mt-4 items-center justify-center py-16 border rounded-md">
              <span className="text-muted-foreground">No portfolios</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {portfolios?.map((portfolio, idx) => (
                <Card
                  key={idx}
                  className="w-full rounded-md border border-border shadow-sm p-6"
                >
                  <div className="relative flex flex-col gap-2">
                    <Link
                      href={portfolio.link}
                      target="_blank"
                      className="flex flex-col gap-2"
                    >
                      <div>
                        {!portfolio.socials && (
                          <Badge className="bg-orange-500 text-white">
                            Need to update socials
                          </Badge>
                        )}
                      </div>
                      <span className="text-xl font-bold">
                        {portfolio.name}
                      </span>
                    </Link>

                    <div className="flex gap-2 items-center justify-start">
                      <Button
                        size="sm"
                        onClick={() => {
                          setItem(portfolio);
                          setIsEditOpen(true);
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setItem(portfolio);
                          setIsDeletePortfolioOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </MaxWidthWrapper>

      {/* Add Portfolio Form */}
      <Dialog open={isAddPortfolio} onOpenChange={setIsAddPortfolio}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add portfolio</DialogTitle>
          </DialogHeader>
          <AddPortfolioForm setOpen={setIsAddPortfolio} item={item} />
        </DialogContent>
      </Dialog>

      {/* Delete Submission Form */}
      <Dialog
        open={isDeleteSubmissionOpen}
        onOpenChange={setIsDeleteSubmissionOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete submission</DialogTitle>
          </DialogHeader>
          <DeleteSubmissionForm
            setOpen={setIsDeleteSubmissionOpen}
            submissionId={item?._id}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Portfolio Form */}
      <Dialog
        open={isDeletePortfolioOpen}
        onOpenChange={setIsDeletePortfolioOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete portfolio</DialogTitle>
          </DialogHeader>
          <DeletePortfolioForm
            setOpen={setIsDeletePortfolioOpen}
            portfolioId={item?._id}
            portfolioImageId={item?.image}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Portfolio Form */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit portfolio</DialogTitle>
          </DialogHeader>
          <EditPortfolioForm setOpen={setIsEditOpen} item={item} />
        </DialogContent>
      </Dialog>
    </>
  );
}
