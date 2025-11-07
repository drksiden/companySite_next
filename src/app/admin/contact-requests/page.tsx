"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  User,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { toast } from "sonner";
import { ContentLayout } from "@/components/admin-panel/content-layout";

interface ClientRequest {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  message: string;
  status: "new" | "in_progress" | "completed" | "closed";
  created_at: string;
  updated_at?: string;
}

export default function ContactRequestsPage() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/contact-requests");
      
      if (!response.ok) {
        throw new Error("Ошибка при загрузке запросов");
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Ошибка при загрузке запросов");
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Фильтр по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.first_name.toLowerCase().includes(query) ||
          req.last_name.toLowerCase().includes(query) ||
          req.email?.toLowerCase().includes(query) ||
          req.phone?.includes(query) ||
          req.message.toLowerCase().includes(query)
      );
    }

    // Фильтр по статусу
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Сортировка по дате создания (новые сверху)
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFilteredRequests(filtered);
  };

  const updateStatus = async (id: string, newStatus: ClientRequest["status"]) => {
    try {
      const response = await fetch(`/api/admin/contact-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при обновлении статуса");
      }

      toast.success("Статус обновлен");
      fetchRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const getStatusBadge = (status: ClientRequest["status"]) => {
    const variants = {
      new: { variant: "default" as const, label: "Новый", icon: Clock },
      in_progress: { variant: "secondary" as const, label: "В работе", icon: Clock },
      completed: { variant: "default" as const, label: "Завершен", icon: CheckCircle2 },
      closed: { variant: "outline" as const, label: "Закрыт", icon: XCircle },
    };

    const { variant, label, icon: Icon } = variants[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <ContentLayout title="Запросы клиентов">
      <div className="container mx-auto px-4 py-8">
        

        {/* Фильтры */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени, email, телефону или сообщению..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="new">Новые</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="completed">Завершенные</SelectItem>
                  <SelectItem value="closed">Закрытые</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Таблица запросов */}
        <Card>
          <CardHeader>
            <CardTitle>
              Запросы ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Запросы не найдены"
                    : "Запросы отсутствуют"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Контакты</TableHead>
                      <TableHead>Сообщение</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">
                            {request.first_name} {request.last_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {request.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <a
                                  href={`mailto:${request.email}`}
                                  className="text-primary hover:underline"
                                >
                                  {request.email}
                                </a>
                              </div>
                            )}
                            {request.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <a
                                  href={`tel:${request.phone}`}
                                  className="text-primary hover:underline"
                                >
                                  {request.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="text-sm line-clamp-2">{request.message}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(request.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Select
                              value={request.status}
                              onValueChange={(value) =>
                                updateStatus(request.id, value as ClientRequest["status"])
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">Новый</SelectItem>
                                <SelectItem value="in_progress">В работе</SelectItem>
                                <SelectItem value="completed">Завершен</SelectItem>
                                <SelectItem value="closed">Закрыт</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Диалог просмотра запроса */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Детали запроса</DialogTitle>
              <DialogDescription>
                Полная информация о запросе клиента
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Клиент</h3>
                  <div className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span>
                      {selectedRequest.first_name} {selectedRequest.last_name}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Контакты</h3>
                  <div className="space-y-2">
                    {selectedRequest.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`mailto:${selectedRequest.email}`}
                          className="text-primary hover:underline"
                        >
                          {selectedRequest.email}
                        </a>
                      </div>
                    )}
                    {selectedRequest.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`tel:${selectedRequest.phone}`}
                          className="text-primary hover:underline"
                        >
                          {selectedRequest.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Сообщение</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedRequest.message}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Статус</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Дата создания</p>
                    <p className="mt-1">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ContentLayout>
  );
}

